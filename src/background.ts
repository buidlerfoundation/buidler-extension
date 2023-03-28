import rules, {
  actionUpdateGitCoinReqHeader,
  actionUpdateGithubReqHeader,
} from "./rules";

const getValueCookie = (cookie: string, key: string) => {
  if (!cookie.includes(key)) return null;
  return cookie.substring(
    cookie.indexOf(key) + key.length,
    cookie.indexOf(";")
  );
};

const updateRules = (
  id?: number,
  newAction?: chrome.declarativeNetRequest.RuleAction
) => {
  const newRules = rules.map((el) => {
    if (el.id === id && newAction) {
      return {
        ...el,
        action: newAction,
      };
    }
    return el;
  });
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: newRules.map((rule) => rule.id), // remove existing rules
    addRules: newRules,
  });
};

chrome.cookies.get(
  { name: "_is_human", url: "https://bounties.gitcoin.co" },
  (cookie) => {
    if (cookie && cookie.value) {
      updateRules(3, actionUpdateGitCoinReqHeader(cookie.value))
    }
  }
);

chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    const responseHeaders = details.responseHeaders;
    if (details.type === "sub_frame") {
      if (details.url.includes("https://bounties.gitcoin.co")) {
        const cookieHeader = responseHeaders.find(
          (el) => el.name === "set-cookie"
        );
        const cookieValue = cookieHeader ? cookieHeader.value : null;
        if (cookieValue) {
          const humanId = getValueCookie(cookieValue, "_is_human=");
          if (humanId) {
            updateRules(3, actionUpdateGitCoinReqHeader(humanId));
          }
        }
      } else if (details.url.includes("https://github.com")) {
        let cookieValue = responseHeaders
          ?.filter((el) => el.name === "set-cookie")
          .map((el) => el.value?.split(" ")?.[0])
          ?.join(" ");
        updateRules(5, actionUpdateGithubReqHeader(cookieValue));
        // const octo = responseHeaders?.find(
        //   (el) => el.name === "set-cookie" && el.value?.includes("_octo=")
        // )?.value;
        // if (octo) {
        //   chrome.cookies.set({url: "https://github.com", name: "_octo", value: getValueCookie(octo, '_octo=')})
        // }
        // chrome.cookies.getAll({url: "https://github.com", domain: "github.com"}).then(cookies => {
        //   const octoCookie = cookies.find(el => el.name === "_octo")
        //   if (octoCookie) {
        //     cookieValue += ` _octo=${octoCookie.value};`
        //   }
        //   updateRules(5, actionUpdateGithubReqHeader(cookieValue));
        // })
      }
    }
  },
  {
    urls: ["https://*.gitcoin.co/*", "https://github.com/*"],
  },
  ["responseHeaders", "extraHeaders"]
);
