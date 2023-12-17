import { v4 as uuidv4 } from 'uuid';

const uniqIdKey = 'Buidler_uniq_id';
export const host = 'buidler.app';
export const baseUrl = `https://${host}`;
export const disabledSidebarKey = "Buidler_disabled_sidebar"
export const disabledDomainKey = "Buidler_disabled_domains"

export const getUniqId = async () => {
  const storage = await chrome.storage.local.get(uniqIdKey);
  const uniqId = storage[uniqIdKey];
  if (uniqId) {
    return uniqId;
  }
  const uuid = uuidv4();
  chrome.storage.local.set({ [uniqIdKey]: uuid });
  return uuid;
};
