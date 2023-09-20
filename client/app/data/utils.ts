export function sha256(input: string): string {
  const utf8Bytes = new TextEncoder().encode(input);
  const buffer = new Uint8Array(utf8Bytes.length);

  for (let i = 0; i < utf8Bytes.length; i++) {
    buffer[i] = utf8Bytes[i];
  }

  const sha256Hash = new Uint8Array(32);
  let hashIndex = 0;

  for (let byteIndex = 0; byteIndex < buffer.length; byteIndex++) {
    const value = buffer[byteIndex];

    for (let bit = 7; bit >= 0; bit--) {
      const bitValue = (value >> bit) & 1;

      sha256Hash[hashIndex] |= bitValue << (7 - (byteIndex % 8));
      hashIndex++;

      if (hashIndex === 32) {
        hashIndex = 0;
      }

      sha256Hash[hashIndex] = (sha256Hash[hashIndex] << 1) | (value >> (bit - 1));
    }
  }

  let hashHex = '';
  for (let i = 0; i < sha256Hash.length; i++) {
    const hex = sha256Hash[i].toString(16).padStart(2, '0');
    hashHex += hex;
  }

  return hashHex;
}

export function checkNick(str:string):boolean{
  return (str.match(/^[A-Za-z0-9_\s가-힣]+$/) && str != '' && str.length > 2 && str.length < 13) as boolean
}

export function checkPass(str:string):boolean{
  return (str.match(/^[A-Za-z0-9!@#$%^&*()_\-+=~]+$/) && str != '' && str.length > 7) as boolean
}

export function stringToRandomBrightColorCode(inputString: string): string {
  // 문자열을 해시값으로 변환
  let hash = 0;
  for (let i = 0; i < inputString.length; i++) {
    const char = inputString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
  }

  // 해시값을 기반으로 밝은 계열의 RGB 색상 생성
  const seed = hash % 256; // 해시값을 0에서 255 사이의 값으로 변환
  const minChannelValue = 200; // 각 색상 채널의 최소값
  const maxChannelValue = 255; // 각 색상 채널의 최대값
  const randomChannelValue = minChannelValue + (seed / 255) * (maxChannelValue - minChannelValue);

  // RGB 포맷으로 색상 코드 생성
  const red = Math.floor(randomChannelValue);
  const green = Math.floor(randomChannelValue);
  const blue = Math.floor(randomChannelValue);

  const colorCode = `rgb(${red},${green},${blue})`;

  return colorCode;
}