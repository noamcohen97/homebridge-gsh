import { Fanv2 } from "./fan-v2";
import { HapClient, ServiceType, CharacteristicType } from '@homebridge/hap-client';
import { SmartHomeV1SyncResponse, SmartHomeV1ExecuteResponseCommands } from 'actions-on-google';
import { AccessoryTypeExecuteResponse } from '../interfaces';

var fan = new Fanv2();

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
      const response = await fan.execute(fanServiceOnOff, commandOnOff);
      expect(response).toBeDefined();
      expect(response.ids).toBeDefined();
      expect(response.status).toBe('SUCCESS');
      // await sleep(10000)
    });


    test('Fan with On/Off only - commandMalformed', async () => {
      const response = await fan.execute(fanServiceOnOff, commandMalformed);
      expect(response).toBeDefined();
      expect(response.ids).toBeDefined();
      expect(response.status).toBe('ERROR');
    });

    test('Fan with On/Off only - commandIncorrectCommand', async () => {
      const response = await fan.execute(fanServiceOnOff, commandIncorrectCommand);
      expect(response).toBeDefined();
      expect(response.ids).toBeDefined();
      expect(response.status).toBe('ERROR');
    });

    test('Fan with On/Off only - Error', async () => {
      expect.assertions(1);
      fanServiceOnOff.serviceCharacteristics[0].setValue = setValueError;
      expect(fan.execute(fanServiceOnOff, commandOnOff)).rejects.toThrow('Error setting value');
      // await sleep(10000)
    });
  });
});

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const setValue = async function (value: string | number | boolean): Promise<CharacteristicType> {
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

const setValueError = async function (value: string | number | boolean): Promise<CharacteristicType> {
  // Perform your operations here
  throw new Error('Error setting value');
  const result: CharacteristicType = {
    "aid": 1,
    "iid": 1,
    "uuid": "00000025-0000-1000-8000-0026BB765291",
    "type": "On",
    "serviceType": "Lightbulb",
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
  return fanServiceOnOff;
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
  return fanServiceOnOff;
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
      uuid: '000000B0-0000-1000-8000-0026BB765291',
      type: 'Active',
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

const commandMalformed = {
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
  ]
};

const commandIncorrectCommand = {
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
      "command": "action.devices.commands.notACommand",
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