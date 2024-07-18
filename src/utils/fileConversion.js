export const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        if (reader.result) {
          resolve(reader.result.split(',')[1]); // Remove data:application/octet-stream;base64, prefix
        } else {
          reject('Error reading blob');
        }
      };
    });
  }


  export const base64ToBytes = async (base64Data) => {
    const bytes = atob(base64Data); // Decode base64 string
    const pdfData = new Uint8Array(bytes.length); // Create a Uint8Array
    for (let i = 0; i < bytes.length; i++) {
      pdfData[i] = bytes.charCodeAt(i); // Convert each character to byte
    }
    return pdfData;
    // Load PDF using Uint8Array
    // Use pdf-lib functionalities on the loaded pdfDoc object
  }

  export const bytesToBase64 = byte_array => {
    const encoded_data = btoa(String.fromCharCode(...byte_array));
    return encoded_data;
  }