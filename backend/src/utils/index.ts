import { ButtonCode } from "src/enums/btn-code.enum";

export const getTemperatureName = (temp: number): ButtonCode => {
  if (temp === 17) return ButtonCode.TEMP_17;
  if (temp === 18) return ButtonCode.TEMP_18;
  if (temp === 19) return ButtonCode.TEMP_19;
  if (temp === 20) return ButtonCode.TEMP_20;
  if (temp === 21) return ButtonCode.TEMP_21;
  if (temp === 22) return ButtonCode.TEMP_22;
  if (temp === 23) return ButtonCode.TEMP_23;
  if (temp === 24) return ButtonCode.TEMP_24;
  if (temp === 25) return ButtonCode.TEMP_25;
  if (temp === 26) return ButtonCode.TEMP_26;
  if (temp === 27) return ButtonCode.TEMP_27;
  if (temp === 28) return ButtonCode.TEMP_28;
  if (temp === 29) return ButtonCode.TEMP_29;
  if (temp === 30) return ButtonCode.TEMP_30;
  return ButtonCode.TEMP_25;
};
