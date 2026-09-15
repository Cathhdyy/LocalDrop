import os from 'os';

export interface NetworkAddressInfo {
  name: string;
  address: string;
  isInternal: boolean;
}

/**
 * Returns all non-internal IPv4 addresses for the machine.
 */
export function getLocalNetworkAddresses(): NetworkAddressInfo[] {
  const interfaces = os.networkInterfaces();
  const addresses: NetworkAddressInfo[] = [];

  for (const [name, netList] of Object.entries(interfaces)) {
    if (!netList) continue;
    for (const net of netList) {
      // IPv4 and non-internal (skip 127.0.0.1)
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push({
          name,
          address: net.address,
          isInternal: net.internal,
        });
      }
    }
  }

  return addresses;
}

/**
 * Gets the primary LAN IP (e.g. 192.168.x.x or 10.x.x.x) or localhost fallback.
 * Prioritizes Wi-Fi / physical interfaces over virtual adapters (VirtualBox, VMware, WSL).
 */
export function getPrimaryNetworkAddress(): string {
  const addresses = getLocalNetworkAddresses();
  if (addresses.length === 0) {
    return '127.0.0.1';
  }

  // Filter out known virtual adapter names and subnets (e.g. VirtualBox 192.168.56.*)
  const isVirtual = (a: NetworkAddressInfo) => {
    const nameLower = a.name.toLowerCase();
    return (
      nameLower.includes('virtual') ||
      nameLower.includes('vbox') ||
      nameLower.includes('vmware') ||
      nameLower.includes('wsl') ||
      nameLower.includes('vethernet') ||
      a.address.startsWith('192.168.56.')
    );
  };

  const nonVirtual = addresses.filter((a) => !isVirtual(a));
  const candidatePool = nonVirtual.length > 0 ? nonVirtual : addresses;

  // Prioritize active Wi-Fi adapters first (e.g. "Wi-Fi", "wlan", "wireless")
  const wifi = candidatePool.find((a) =>
    /wi-?fi|wlan|wireless/i.test(a.name)
  );
  if (wifi) return wifi.address;

  // Then physical Ethernet
  const ethernet = candidatePool.find((a) =>
    /ethernet|eth|en\d/i.test(a.name)
  );
  if (ethernet) return ethernet.address;

  // Next standard RFC1918 private subnets
  const privateSubnet = candidatePool.find(
    (a) =>
      a.address.startsWith('192.168.') ||
      a.address.startsWith('10.') ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(a.address)
  );

  return privateSubnet ? privateSubnet.address : candidatePool[0].address;
}
