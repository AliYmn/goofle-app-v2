import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

declare global {
  var __goofloPurchasesInitialized: boolean | undefined;
  var __goofloPurchasesWarningShown: boolean | undefined;
}

export const ENTITLEMENT_PRO = 'Gooflo Pro';

export const PRODUCT_IDS = {
  monthly: 'monthly',
  yearly: 'yearly',
  credits50: 'credits_50',
  credits120: 'credits_120',
  credits300: 'credits_300',
};

function getExpectedRevenueCatKeyPrefix() {
  if (Platform.OS === 'ios') return 'appl_';
  if (Platform.OS === 'android') return 'goog_';
  return '';
}

function isPurchasesConfigured() {
  return globalThis.__goofloPurchasesInitialized === true;
}

export function initPurchases(): void {
  const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY?.trim();
  const expectedPrefix = getExpectedRevenueCatKeyPrefix();

  if (!apiKey) return;
  if (expectedPrefix && !apiKey.startsWith(expectedPrefix)) {
    if (__DEV__ && !globalThis.__goofloPurchasesWarningShown) {
      console.warn(
        `[RevenueCat] Skipping initialization. Expected a ${Platform.OS} public SDK key starting with "${expectedPrefix}".`
      );
      globalThis.__goofloPurchasesWarningShown = true;
    }
    return;
  }
  if (isPurchasesConfigured()) return;

  if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  Purchases.configure({ apiKey });
  globalThis.__goofloPurchasesInitialized = true;
}

export async function identifyCustomer(userId: string): Promise<void> {
  if (!isPurchasesConfigured()) return;
  await Purchases.logIn(userId);
}

export async function checkProStatus(): Promise<{ isPro: boolean; expiresAt: string | null }> {
  if (!isPurchasesConfigured()) {
    return { isPro: false, expiresAt: null };
  }

  try {
    const info = await Purchases.getCustomerInfo();
    const entitlement = info.entitlements.active[ENTITLEMENT_PRO];
    return {
      isPro: !!entitlement,
      expiresAt: entitlement?.expirationDate ?? null,
    };
  } catch {
    return { isPro: false, expiresAt: null };
  }
}

export async function purchasePackage(
  packageId: string,
): Promise<{ success: boolean; error?: string }> {
  if (!isPurchasesConfigured()) {
    return { success: false, error: 'Purchases are not configured for this build' };
  }

  try {
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;
    if (!current) return { success: false, error: 'No offerings available' };

    const pkg = current.availablePackages.find((p) => p.identifier === packageId);
    if (!pkg) return { success: false, error: 'Package not found' };

    await Purchases.purchasePackage(pkg);
    return { success: true };
  } catch (e: any) {
    if (e.userCancelled) return { success: false };
    return { success: false, error: e.message };
  }
}

export async function restorePurchases(): Promise<{ isPro: boolean }> {
  if (!isPurchasesConfigured()) {
    return { isPro: false };
  }

  try {
    const info = await Purchases.restorePurchases();
    return { isPro: !!info.entitlements.active[ENTITLEMENT_PRO] };
  } catch {
    return { isPro: false };
  }
}
