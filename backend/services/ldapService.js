const ldap = require("ldapjs");

const isLDAPConfigured = () => {
  const requiredSettings = [
    "LDAP_URL",
    "LDAP_PORT",
    "LDAP_BIND_DN",
    "LDAP_BIND_PASSWORD",
    "LDAP_USER_SEARCH_FILTER",
  ];

  const missingSettings = requiredSettings.filter(
    (setting) => !process.env[setting]
  );

  if (
    !process.env.LDAP_USER_SEARCH_BASE &&
    !process.env.LDAP_BASE_DN
  ) {
    missingSettings.push(
      "LDAP_USER_SEARCH_BASE or LDAP_BASE_DN"
    );
  }

  if (missingSettings.length > 0) {
    console.error(
      "Missing LDAP configuration:",
      missingSettings.join(", ")
    );

    return false;
  }

  return true;
};

/*
 * Escape characters that have special meaning
 * inside an LDAP search filter.
 */
const escapeLDAPFilterValue = (value) => {
  return String(value)
    .replace(/\\/g, "\\5c")
    .replace(/\*/g, "\\2a")
    .replace(/\(/g, "\\28")
    .replace(/\)/g, "\\29")
    .replace(/\0/g, "\\00");
};

/*
 * Create an LDAP client.
 */
const createLDAPClient = () => {
  const ldapUrl = process.env.LDAP_URL;
  const ldapPort = process.env.LDAP_PORT;

  const hasProtocol = ldapUrl.includes("://");
  const hasPort = /:\d+$/.test(ldapUrl);

  let url = ldapUrl;

  if (!hasProtocol) {
    url = `ldap://${url}`;
  }

  if (!hasPort) {
    url = `${url}:${ldapPort}`;
  }

  return ldap.createClient({
    url,
    connectTimeout: 10000,
    timeout: 10000,
  });
};

/*
 * Search LDAP for the user's Distinguished Name (DN).
 */
const findUserDN = async (
  client,
  username,
  bindDn,
  bindPassword,
  userSearchBase,
  userSearchFilter
) => {
  /*
   * First bind using the configured LDAP
   * service account.
   */
  await new Promise((resolve, reject) => {
    client.bind(
      bindDn,
      bindPassword,
      (error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      }
    );
  });

  const escapedUsername =
    escapeLDAPFilterValue(username);

  /*
   * Example:
   *
   * LDAP_USER_SEARCH_FILTER=
   * (sAMAccountName={username})
   *
   * becomes:
   *
   * (sAMAccountName=sarjna)
   */
  const filter = userSearchFilter.replace(
    /\{username\}/g,
    escapedUsername
  );

  return new Promise((resolve, reject) => {
    client.search(
      userSearchBase,
      {
        scope: "sub",
        filter,
        attributes: ["dn"],
        sizeLimit: 2,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        let foundUserDN = null;
        let matchCount = 0;

        result.on(
          "searchEntry",
          (entry) => {
            matchCount += 1;

            if (entry.pojo?.objectName) {
              foundUserDN =
                entry.pojo.objectName;
            } else if (entry.object?.dn) {
              foundUserDN = entry.object.dn;
            }
          }
        );

        result.on(
          "error",
          (searchError) => {
            reject(searchError);
          }
        );

        result.on("end", () => {
          if (matchCount === 0) {
            reject(
              new Error("LDAP user not found.")
            );
            return;
          }

          if (matchCount > 1) {
            reject(
              new Error(
                "Multiple LDAP users matched the username."
              )
            );
            return;
          }

          resolve(foundUserDN);
        });
      }
    );
  });
};

/*
 * Authenticate a user against GSPL LDAP.
 */
const authenticateWithLDAP = async (
  username,
  password
) => {
  if (!username || !password) {
    throw new Error(
      "Username and password are required."
    );
  }

  if (!isLDAPConfigured()) {
    return {
      success: false,
      code: "LDAP_CONFIGURATION_ERROR",
      message:
        "LDAP configuration is not available.",
    };
  }

  const bindDn = process.env.LDAP_BIND_DN;

  const bindPassword =
    process.env.LDAP_BIND_PASSWORD;

  const userSearchBase =
    process.env.LDAP_USER_SEARCH_BASE ||
    process.env.LDAP_BASE_DN;

  const userSearchFilter =
    process.env.LDAP_USER_SEARCH_FILTER;

  /*
   * Service-account bind is required for the
   * search-based authentication flow.
   */
  if (!bindDn || !bindPassword) {
    throw new Error(
      "LDAP bind account configuration is not available."
    );
  }

  const client = createLDAPClient();

  try {
    /*
     * Step 1:
     * Find the user's LDAP Distinguished Name.
     */
    const userDN = await findUserDN(
      client,
      username,
      bindDn,
      bindPassword,
      userSearchBase,
      userSearchFilter
    );

    if (!userDN) {
      return {
        success: false,
        message:
          "Invalid username or password",
      };
    }

    /*
     * Step 2:
     * Bind using the user's own password.
     *
     * This verifies the password against LDAP.
     */
    await new Promise((resolve, reject) => {
      client.bind(
        userDN,
        password,
        (error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        }
      );
    });

    return {
      success: true,
      message:
        "LDAP authentication successful",
      username,
      userDN,
    };
  } catch (error) {
    console.error(
      "LDAP authentication error:",
      error.message
    );

    /*
     * Do not return the raw LDAP error to the
     * authentication controller/client.
     */
    return {
      success: false,
      code: "LDAP_AUTHENTICATION_FAILED",
      message:
        "Invalid username or password",
    };
  } finally {
    /*
     * Always close the LDAP connection.
     */
    try {
      client.unbind();
    } catch (unbindError) {
      console.error(
        "LDAP unbind error:",
        unbindError.message
      );
    }
  }
};

module.exports = {
  authenticateWithLDAP,
  isLDAPConfigured,
};