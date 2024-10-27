import { Fan } from "./fan";
import { HapClient, ServiceType, CharacteristicType } from '@homebridge/hap-client';
import { SmartHomeV1SyncResponse } from 'actions-on-google';
import { AccessoryTypeExecuteResponse } from '../interfaces';

var fan = new Fan();

describe('Fan', () => {
  describe('sync message', () => {
    test('Fan with On/Off only', async () => {
      const response: any = fan.sync(fanServiceOnOff);
      expect(response).toBeDefined();
      expect(response.type).toBe('action.devices.types.FAN');
      expect(response.traits).toContain('action.devices.traits.OnOff');
      expect(response.traits).not.toContain('action.devices.traits.Brightness');
      expect(response.traits).not.toContain('action.devices.traits.ColorSetting');
      expect(response.attributes).not.toBeDefined();
      // await sleep(10000)
    });
  });
  describe('query message', () => {
    test('Fan with On/Off only', async () => {
      const response = fan.query(fanServiceOnOff);
      expect(response).toBeDefined();
      expect(response.on).toBeDefined();
      expect(response.online).toBeDefined();
      // await sleep(10000)
    });
  });

  describe('execute message', () => {
    test('Fan with On/Off only', async () => {
      const response: any = await fan.execute(fanServiceOnOff, commandOnOff);
      expect(response).toBeDefined();
      expect(response.payload).toBeDefined();
      expect(response.payload.characteristics).toBeDefined();
      // await sleep(10000)
    });
  });
});

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const setValue = async function (value: string | number | boolean): Promise<CharacteristicType> {
  // Perform your operations here
  console.log('setValue', value);
  const result: CharacteristicType = {
    "aid": 1,
    "iid": 1,
    "uuid": "00000025-0000-1000-8000-0026BB765291",
    "type": "On",
    "serviceType": "Fan",
    "serviceName": "Trailer Step",
    "description": "On",
    "value": 0,
    "format": "bool",
    "perms": [
      "ev",
      "pr",
      "pw"
    ],
    "canRead": true,
    "canWrite": true,
    "ev": true
  };
  return result;
};

const getValue = async function (): Promise<CharacteristicType> {
  // Perform your operations here
  const result: CharacteristicType = {
    "aid": 1,
    "iid": 1,
    "uuid": "00000025-0000-1000-8000-0026BB765291",
    "type": "On",
    "serviceType": "Fan",
    "serviceName": "Trailer Step",
    "description": "On",
    "value": 0,
    "format": "bool",
    "perms": [
      "ev",
      "pr",
      "pw"
    ],
    "canRead": true,
    "canWrite": true,
    "ev": true
  };
  return result;
};

const refreshCharacteristics = async function (): Promise<ServiceType> {
  return fanServiceHue;
};

const setCharacteristic = async function (value: string | number | boolean): Promise<ServiceType> {
  // Perform your operations here
  const result: CharacteristicType = {
    "aid": 1,
    "iid": 1,
    "uuid": "00000025-0000-1000-8000-0026BB765291",
    "type": "On",
    "serviceType": "Fan",
    "serviceName": "Trailer Step",
    "description": "On",
    "value": 0,
    "format": "bool",
    "perms": [
      "ev",
      "pr",
      "pw"
    ],
    "canRead": true,
    "canWrite": true,
    "ev": true
  };
  return fanServiceHue;
};

const getCharacteristic = function (): CharacteristicType {
  // Perform your operations here
  const result: CharacteristicType = {
    "aid": 1,
    "iid": 1,
    "uuid": "00000025-0000-1000-8000-0026BB765291",
    "type": "On",
    "serviceType": "Fan",
    "serviceName": "Trailer Step",
    "description": "On",
    "value": 0,
    "format": "bool",
    "perms": [
      "ev",
      "pr",
      "pw"
    ],
    "canRead": true,
    "canWrite": true,
    "ev": true
  };
  return result;
};

const fanServiceHue: ServiceType = {
  aid: 58,
  iid: 8,
  uuid: '00000043-0000-1000-8000-0026BB765291',
  type: 'Fan',
  humanType: 'Fan',
  serviceName: 'Powder Shower',
  serviceCharacteristics: [
    {
      aid: 58,
      iid: 10,
      uuid: '00000025-0000-1000-8000-0026BB765291',
      type: 'On',
      serviceType: 'Fan',
      serviceName: 'Powder Shower',
      description: 'On',
      value: 0,
      format: 'bool',
      perms: ["ev", "pr", "pw"],
      unit: undefined,
      maxValue: undefined,
      minValue: undefined,
      minStep: undefined,
      canRead: true,
      canWrite: true,
      ev: true,
      setValue: setValue,
      getValue: getValue
    },
    {
      aid: 58,
      iid: 11,
      uuid: '000000E3-0000-1000-8000-0026BB765291',
      type: 'ConfiguredName',
      serviceType: 'Fan',
      serviceName: 'Powder Shower',
      description: 'Configured Name',
      value: 'Powder Shower',
      format: 'string',
      perms: ["ev", "pr", "pw"],
      unit: undefined,
      maxValue: undefined,
      minValue: undefined,
      minStep: undefined,
      canRead: true,
      canWrite: true,
      ev: true,
      setValue: setValue,
      getValue: getValue
    },
    {
      aid: 58,
      iid: 12,
      uuid: '00000008-0000-1000-8000-0026BB765291',
      type: 'Brightness',
      serviceType: 'Fan',
      serviceName: 'Powder Shower',
      description: 'Brightness',
      value: 65,
      format: 'int',
      perms: ["ev", "pr", "pw"],
      unit: 'percentage',
      maxValue: 100,
      minValue: 0,
      minStep: 1,
      canRead: true,
      canWrite: true,
      ev: true,
      setValue: setValue,
      getValue: getValue
    },
    {
      aid: 58,
      iid: 13,
      uuid: '00000013-0000-1000-8000-0026BB765291',
      type: 'Hue',
      serviceType: 'Fan',
      serviceName: 'Powder Shower',
      description: 'Hue',
      value: 0,
      format: 'float',
      perms: ["ev", "pr", "pw"],
      unit: 'arcdegrees',
      maxValue: 360,
      minValue: 0,
      minStep: 1,
      canRead: true,
      canWrite: true,
      ev: true,
      setValue: setValue,
      getValue: getValue
    },
    {
      aid: 58,
      iid: 14,
      uuid: '0000002F-0000-1000-8000-0026BB765291',
      type: 'Saturation',
      serviceType: 'Fan',
      serviceName: 'Powder Shower',
      description: 'Saturation',
      value: 0,
      format: 'float',
      perms: ["ev", "pr", "pw"],
      unit: 'percentage',
      maxValue: 100,
      minValue: 0,
      minStep: 1,
      canRead: true,
      canWrite: true,
      ev: true,
      setValue: setValue,
      getValue: getValue
    },
    {
      aid: 58,
      iid: 15,
      uuid: '000000CE-0000-1000-8000-0026BB765291',
      type: 'ColorTemperature',
      serviceType: 'Fan',
      serviceName: 'Powder Shower',
      description: 'Color Temperature',
      value: 325,
      format: 'int',
      perms: ["ev", "pr", "pw"],
      unit: undefined,
      maxValue: 500,
      minValue: 140,
      minStep: 1,
      canRead: true,
      canWrite: true,
      ev: true,
      setValue: setValue,
      getValue: getValue
    }
  ],
  accessoryInformation: {
    Manufacturer: 'Tasmota',
    Model: 'Tuya MCU',
    Name: 'Powder Shower',
    'Serial Number': 'ED8243-jessie',
    'Firmware Revision': '9.5.0tasmota'
  },
  values: {
    On: 0,
    ConfiguredName: 'Powder Shower',
    Brightness: 65,
    Hue: 0,
    Saturation: 0,
    ColorTemperature: 325
  },
  linked: undefined,
  instance: {
    name: 'homebridge',
    username: '1C:22:3D:E3:CF:34',
    ipAddress: '192.168.1.11',
    port: 46283
  },
  uniqueId: '2a1f1a87419c2afbd847828b96095f892975c36572751ab71f53edf0c5372fdb',
  refreshCharacteristics: refreshCharacteristics,
  setCharacteristic: setCharacteristic,
  getCharacteristic: getCharacteristic
};

const fanServiceOnOff: ServiceType = {
  aid: 13,
  iid: 8,
  uuid: '00000043-0000-1000-8000-0026BB765291',
  type: 'Fan',
  humanType: 'Fan',
  serviceName: 'Shed Light',
  serviceCharacteristics: [
    {
      aid: 13,
      iid: 10,
      uuid: '00000025-0000-1000-8000-0026BB765291',
      type: 'On',
      serviceType: 'Fan',
      serviceName: 'Shed Light',
      description: 'On',
      value: 0,
      format: 'bool',
      perms: ["ev", "pr", "pw"],
      unit: undefined,
      maxValue: undefined,
      minValue: undefined,
      minStep: undefined,
      canRead: true,
      canWrite: true,
      ev: true,
      setValue: setValue,
      getValue: getValue
    },
    {
      aid: 13,
      iid: 11,
      uuid: '000000E3-0000-1000-8000-0026BB765291',
      type: 'ConfiguredName',
      serviceType: 'Fan',
      serviceName: 'Shed Light',
      description: 'Configured Name',
      value: 'Shed Light',
      format: 'string',
      perms: ["ev", "pr", "pw"],
      unit: undefined,
      maxValue: undefined,
      minValue: undefined,
      minStep: undefined,
      canRead: true,
      canWrite: true,
      ev: true,
      setValue: setValue,
      getValue: getValue
    }
  ],
  accessoryInformation: {
    Manufacturer: 'Tasmota',
    Model: 'WiOn',
    Name: 'Shed Light',
    'Serial Number': '02231D-jessie',
    'Firmware Revision': '9.5.0tasmota'
  },
  values: { On: 0, ConfiguredName: 'Shed Light' },
  linked: undefined,
  instance: {
    name: 'homebridge',
    username: '1C:22:3D:E3:CF:34',
    ipAddress: '192.168.1.11',
    port: 46283,
  },
  uniqueId: '664195d5556f1e0b424ed32bcd863ec8954c76f8ab81cc399f0e24f8827806d1',
  refreshCharacteristics: refreshCharacteristics,
  setCharacteristic: setCharacteristic,
  getCharacteristic: getCharacteristic
};

const fanServiceDimmer: ServiceType = {
  aid: 14,
  iid: 8,
  uuid: '00000043-0000-1000-8000-0026BB765291',
  type: 'Fan',
  humanType: 'Fan',
  serviceName: 'Front Hall',
  serviceCharacteristics: [
    {
      aid: 14,
      iid: 10,
      uuid: '00000025-0000-1000-8000-0026BB765291',
      type: 'On',
      serviceType: 'Fan',
      serviceName: 'Front Hall',
      description: 'On',
      value: 0,
      format: 'bool',
      perms: ["ev", "pr", "pw"],
      unit: undefined,
      maxValue: undefined,
      minValue: undefined,
      minStep: undefined,
      canRead: true,
      canWrite: true,
      ev: true,
      setValue: setValue,
      getValue: getValue
    },
    {
      aid: 14,
      iid: 11,
      uuid: '00000008-0000-1000-8000-0026BB765291',
      type: 'Brightness',
      serviceType: 'Fan',
      serviceName: 'Front Hall',
      description: 'Brightness',
      value: 100,
      format: 'int',
      perms: ["ev", "pr", "pw"],
      unit: 'percentage',
      maxValue: 100,
      minValue: 0,
      minStep: 1,
      canRead: true,
      canWrite: true,
      ev: true,
      setValue: setValue,
      getValue: getValue
    },
    {
      aid: 14,
      iid: 12,
      uuid: '000000E3-0000-1000-8000-0026BB765291',
      type: 'ConfiguredName',
      serviceType: 'Fan',
      serviceName: 'Front Hall',
      description: 'Configured Name',
      value: 'Front Hall',
      format: 'string',
      perms: ["ev", "pr", "pw"],
      unit: undefined,
      maxValue: undefined,
      minValue: undefined,
      minStep: undefined,
      canRead: true,
      canWrite: true,
      ev: true,
      setValue: setValue,
      getValue: getValue
    }
  ],
  accessoryInformation: {
    Manufacturer: 'Tasmota',
    Model: 'Tuya MCU',
    Name: 'Front Hall',
    'Serial Number': '23CAC5-jessie',
    'Firmware Revision': '9.5.0tasmota'
  },
  values: { On: 0, Brightness: 100, ConfiguredName: 'Front Hall' },
  linked: undefined,
  instance: {
    name: 'homebridge',
    username: '1C:22:3D:E3:CF:34',
    ipAddress: '192.168.1.11',
    port: 46283
  },
  uniqueId: '028fc478c0b4b116ead9be0dc8a72251b351b745cbc3961704268737101c803d',
  refreshCharacteristics: refreshCharacteristics,
  setCharacteristic: setCharacteristic,
  getCharacteristic: getCharacteristic
};

const commandOnOff = {
  "devices": [
    {
      "customData": {
        "aid": 75,
        "iid": 8,
        "instanceIpAddress": "192.168.1.11",
        "instancePort": 46283,
        "instanceUsername": "1C:22:3D:E3:CF:34"
      },
      "id": "b9245954ec41632a14076df3bbb7336f756c17ca4b040914a593e14d652d5738"
    }
  ],
  "execution": [
    {
      "command": "action.devices.commands.OnOff",
      "params": {
        "on": true
      }
    }
  ]
};

const commandBrightness = {
  "devices": [
    {
      "customData": {
        "aid": 75,
        "iid": 8,
        "instanceIpAddress": "192.168.1.11",
        "instancePort": 46283,
        "instanceUsername": "1C:22:3D:E3:CF:34"
      },
      "id": "b9245954ec41632a14076df3bbb7336f756c17ca4b040914a593e14d652d5738"
    }
  ],
  "execution": [
    {
      "command": "action.devices.commands.OnOff",
      "params": {
        "on": true
      }
    }
  ]
};

const commandColorHSV = {
  "devices": [
    {
      "customData": {
        "aid": 75,
        "iid": 8,
        "instanceIpAddress": "192.168.1.11",
        "instancePort": 46283,
        "instanceUsername": "1C:22:3D:E3:CF:34"
      },
      "id": "b9245954ec41632a14076df3bbb7336f756c17ca4b040914a593e14d652d5738"
    }
  ],
  "execution": [
    {
      "command": "action.devices.commands.OnOff",
      "params": {
        "on": true
      }
    }
  ]
};

const commandColorTemperature = {
  "devices": [
    {
      "customData": {
        "aid": 75,
        "iid": 8,
        "instanceIpAddress": "192.168.1.11",
        "instancePort": 46283,
        "instanceUsername": "1C:22:3D:E3:CF:34"
      },
      "id": "b9245954ec41632a14076df3bbb7336f756c17ca4b040914a593e14d652d5738"
    }
  ],
  "execution": [
    {
      "command": "action.devices.commands.OnOff",
      "params": {
        "on": true
      }
    }
  ]
};