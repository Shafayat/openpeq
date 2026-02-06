// WebHID API Type Definitions
// These types are not yet included in the default TypeScript lib

interface HIDDevice extends EventTarget {
  readonly opened: boolean;
  readonly vendorId: number;
  readonly productId: number;
  readonly productName: string;
  readonly collections: HIDCollectionInfo[];
  oninputreport: ((this: HIDDevice, ev: HIDInputReportEvent) => void) | null;
  open(): Promise<void>;
  close(): Promise<void>;
  sendReport(reportId: number, data: BufferSource): Promise<void>;
  sendFeatureReport(reportId: number, data: BufferSource): Promise<void>;
  receiveFeatureReport(reportId: number): Promise<DataView>;
}

interface HIDInputReportEvent extends Event {
  readonly device: HIDDevice;
  readonly reportId: number;
  readonly data: DataView;
}

interface HIDCollectionInfo {
  readonly usagePage: number;
  readonly usage: number;
  readonly type: number;
  readonly children: HIDCollectionInfo[];
  readonly inputReports: HIDReportInfo[];
  readonly outputReports: HIDReportInfo[];
  readonly featureReports: HIDReportInfo[];
}

interface HIDReportInfo {
  readonly reportId: number;
  readonly items: HIDReportItem[];
}

interface HIDReportItem {
  readonly isAbsolute: boolean;
  readonly isArray: boolean;
  readonly isRange: boolean;
  readonly hasNull: boolean;
  readonly usages: number[];
  readonly usageMinimum: number;
  readonly usageMaximum: number;
  readonly reportSize: number;
  readonly reportCount: number;
  readonly logicalMinimum: number;
  readonly logicalMaximum: number;
  readonly physicalMinimum: number;
  readonly physicalMaximum: number;
  readonly unitExponent: number;
  readonly unitSystem: string;
  readonly unitFactorLengthExponent: number;
  readonly unitFactorMassExponent: number;
  readonly unitFactorTimeExponent: number;
  readonly unitFactorTemperatureExponent: number;
  readonly unitFactorCurrentExponent: number;
  readonly unitFactorLuminousIntensityExponent: number;
}

interface HIDDeviceFilter {
  vendorId?: number;
  productId?: number;
  usagePage?: number;
  usage?: number;
}

interface HIDDeviceRequestOptions {
  filters: HIDDeviceFilter[];
}

interface HID extends EventTarget {
  getDevices(): Promise<HIDDevice[]>;
  requestDevice(options: HIDDeviceRequestOptions): Promise<HIDDevice[]>;
}

interface Navigator {
  readonly hid: HID;
}
