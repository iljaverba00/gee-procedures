import { signBase64CSP, signingTypes } from 'components/Files/signingCSP/utillsCSP';

const SIGNATURE_SPEC_NS = 'http://www.w3.org/2000/09/xmldsig#';
const SIGNATURE_SPEC_ENV = `${SIGNATURE_SPEC_NS}enveloped-signature`;
const SIGNATURE_C14n = 'http://www.w3.org/2001/10/xml-exc-c14n#';

export async function signXML(mainXML, certificate, files) {
  const data = await generateDataForSigning(certificate, files);

  const signatureNode = getSignatureNode(mainXML, data);
  const filesNode = getFilesNode(mainXML, data.signedFiles);
  const testNode = getTestMessageNode(mainXML);

  const personalSigNode = mainXML.getElementsByTagName('t:PersonalSignature')?.[0];
  const requestDataNode = personalSigNode.parentNode; //<SenderProvidedRequestData/>

  personalSigNode.appendChild(signatureNode);
  requestDataNode.appendChild(filesNode);
  requestDataNode.appendChild(testNode);
  return mainXML;
}

export function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  const binary = bytes.reduce((s, b) => s + String.fromCharCode(b), '');
  return window.btoa(binary);
}

async function generateDataForSigning(certificate, files) {
  const result = {
    signedFiles: [],
    signatureValue: '',
    x509Certificate: '',
    digestValue: '',
    signatureMethod: '',
    digestMethod: '',
  };

  //подписываем файлы
  const fileNames = Object.keys(files);
  for await (const fileName of fileNames) {
    const bytes = files[fileName];
    const base64 = arrayBufferToBase64(bytes);
    const signed = await signBase64CSP(fileName, base64, signingTypes.ATTACHED, certificate);
    result.signedFiles.push({
      name: fileName,
      value: signed.fileSignAt,
    });
  }

  //задаем алгоритм шифрования
  const ALG_OID_2_SIGN_METHOD = {
    '1.2.643.7.1.1.1.1':
      'urn:ietf:params:xml:ns:cpxmlsec:algorithms:gostr34102012-gostr34112012-256',
    '1.2.643.7.1.1.1.2':
      'urn:ietf:params:xml:ns:cpxmlsec:algorithms:gostr34102012-gostr34112012-512',
    '1.2.643.2.2.19': 'urn:ietf:params:xml:ns:cpxmlsec:algorithms:gostr34102001-gostr3411',
    '1.2.643.2.2.3': 'urn:ietf:params:xml:ns:cpxmlsec:algorithms:gostr34102001-gostr3411',
  };
  const ALG_OID_2_DIGEST_METHOD = {
    '1.2.643.7.1.1.1.1': 'urn:ietf:params:xml:ns:cpxmlsec:algorithms:gostr34112012-256',
    '1.2.643.7.1.1.1.2': 'urn:ietf:params:xml:ns:cpxmlsec:algorithms:gostr34112012-512',
    '1.2.643.2.2.19': 'urn:ietf:params:xml:ns:cpxmlsec:algorithms:gostr3411',
    '1.2.643.2.2.3': 'urn:ietf:params:xml:ns:cpxmlsec:algorithms:gostr3411',
  };
  const algorithm = await certificate.getAlgorithm();
  if (algorithm.oid === '1.2.643.2.2.3') {
    result.signatureMethod = 'urn:ietf:params:xml:ns:cpxmlsec:algorithms:gostr34102001-gostr3411';
    result.digestMethod = 'urn:ietf:params:xml:ns:cpxmlsec:algorithms:gostr3411';
  } else {
    result.signatureMethod = ALG_OID_2_SIGN_METHOD[algorithm.oid];
    result.digestMethod = ALG_OID_2_DIGEST_METHOD[algorithm.oid];
  }

  //todo Необходимо доработать этот блок. Ошибка при получении публичного ключа.
  result.digestValue = '';
  const privateKey = await certificate._cadesCertificate.PrivateKey;
  const publicKey = await certificate._cadesCertificate.PublicKey();
  result.x509Certificate = await privateKey.CacheKey(); //приватный ключ
  result.signatureValue = await (await publicKey.EncodedKey).Value(); //сертификат

  return result;
}

// <ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
//   <ds:SignedInfo>
//     <ds:CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>
//     <ds:SignatureMethod
//       Algorithm="urn:ietf:params:xml:ns:cpxmlsec:algorithms:gostr34102001-gostr3411"/>
//     <ds:Reference URI="">
//       <ds:Transforms>
//         <ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
//         <ds:Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>
//       </ds:Transforms>
//       <ds:DigestMethod Algorithm="urn:ietf:params:xml:ns:cpxmlsec:algorithms:gostr3411"/>
//       <ds:DigestValue>wsbl/eKjgLROPteUoMtT6D0DyRD+JLzPFMRuxs3XobI=</ds:DigestValue>
//     </ds:Reference>
//   </ds:SignedInfo>
//   <ds:SignatureValue>
//     DUaGt2LrEWe9/h5DBZN8uTE69rdDTB42v0FNzBPms1JD6xWo3fO2p13mEPI2JTeQyua4HdaNkTVvM6/SDJynww==
//   </ds:SignatureValue>
//   <ds:KeyInfo>
//     <ds:X509Data>
//       <ds:X509Certificate>
//         MIIBjzCCAT6gAwIBAgIFAKwCl8owCAYGKoUDAgIDMDExCzAJBgNVBAYTAlJVMRIwEAYDVQQKDAlDcnlwdG9Qcm8xDjAMBgNVBAMMBUFsaWFzMB4XDTI0MDcxMTA2MTc0OVoXDTI1MDcxMTA2MTc0OVowMTELMAkGA1UEBhMCUlUxEjAQBgNVBAoMCUNyeXB0b1BybzEOMAwGA1UEAwwFQWxpYXMwYzAcBgYqhQMCAhMwEgYHKoUDAgIkAAYHKoUDAgIeAQNDAARAnM1AdUbSA6DEMlbT//MF722Ugo6gE/I3MgGSAHVhaWVPhEvTcg+LgJQsDubW6VURJSBEhTFPzqxkiyZtjc5FtaM7MDkwDgYDVR0PAQH/BAQDAgPoMBMGA1UdJQQMMAoGCCsGAQUFBwMCMBIGA1UdEwEB/wQIMAYBAf8CAQUwCAYGKoUDAgIDA0EAh23SdIBSsd+0TVYGdJw++9nxSTASQ5TWpFVbvlmBBinpOEO2ioPoczmphxl8zcDIajsbFDHlInhRfrp2iPwzKA==
//       </ds:X509Certificate>
//     </ds:X509Data>
//   </ds:KeyInfo>
// </ds:Signature>
function getSignatureNode(mainXml, data) {
  // const signatureValue = "X+PalLkYvHSCjtCibWHL/CvEEJ8Z49YQWpMXLa+4dxARzf+v2BVpixBRoSITw6eqkFAKec5eHdTX07fH1VH/kQ==";
  // const x509Certificate = "MIIBjzCCAT6gAwIBAgIFAKwCl8owCAYGKoUDAgIDMDExCzAJBgNVBAYTAlJVMRIwEAYDVQQKDAlDcnlwdG9Qcm8xDjAMBgNVBAMMBUFsaWFzMB4XDTI0MDcxMTA2MTc0OVoXDTI1MDcxMTA2MTc0OVowMTELMAkGA1UEBhMCUlUxEjAQBgNVBAoMCUNyeXB0b1BybzEOMAwGA1UEAwwFQWxpYXMwYzAcBgYqhQMCAhMwEgYHKoUDAgIkAAYHKoUDAgIeAQNDAARAnM1AdUbSA6DEMlbT//MF722Ugo6gE/I3MgGSAHVhaWVPhEvTcg+LgJQsDubW6VURJSBEhTFPzqxkiyZtjc5FtaM7MDkwDgYDVR0PAQH/BAQDAgPoMBMGA1UdJQQMMAoGCCsGAQUFBwMCMBIGA1UdEwEB/wQIMAYBAf8CAQUwCAYGKoUDAgIDA0EAh23SdIBSsd+0TVYGdJw++9nxSTASQ5TWpFVbvlmBBinpOEO2ioPoczmphxl8zcDIajsbFDHlInhRfrp2iPwzKA==";
  // const digestValue = "wtsqnc1AvTxJVz+ClOSNaULMnGNC5Kjp2rAriMVWtIg=";
  // const signatureMethod = "urn:ietf:params:xml:ns:cpxmlsec:algorithms:gostr34102001-gostr3411";
  // const digestMethod = "urn:ietf:params:xml:ns:cpxmlsec:algorithms:gostr3411"

  const { signatureValue, x509Certificate, digestValue, signatureMethod, digestMethod } = data;

  // Узел - данные для подписания
  const signedInfoNode = mainXml.createElement('ds:SignedInfo');
  const canonicalizationMethodNode = mainXml.createElement('ds:CanonicalizationMethod');
  const signatureMethodNode = mainXml.createElement('ds:SignatureMethod');
  const referenceNode = mainXml.createElement('ds:Reference');
  const transformsNode = mainXml.createElement('ds:Transforms');
  const digestMethodNode = mainXml.createElement('ds:DigestMethod');
  const digestValueNode = mainXml.createElement('ds:DigestValue');
  const transform1Node = mainXml.createElement('ds:Transform');
  const transform2Node = mainXml.createElement('ds:Transform');

  canonicalizationMethodNode.setAttribute('Algorithm', SIGNATURE_C14n);
  signatureMethodNode.setAttribute('Algorithm', signatureMethod);
  referenceNode.setAttribute('URI', '');
  digestMethodNode.setAttribute('Algorithm', digestMethod);
  transform1Node.setAttribute('Algorithm', SIGNATURE_SPEC_ENV);
  transform2Node.setAttribute('Algorithm', SIGNATURE_C14n);
  digestValueNode.innerHTML = digestValue;

  signedInfoNode.appendChild(canonicalizationMethodNode);
  signedInfoNode.appendChild(signatureMethodNode);
  signedInfoNode.appendChild(referenceNode);
  referenceNode.appendChild(transformsNode);
  referenceNode.appendChild(digestMethodNode);
  referenceNode.appendChild(digestValueNode);
  transformsNode.appendChild(transform1Node);
  transformsNode.appendChild(transform2Node);

  // Узел - подпись
  const signatureValueNode = mainXml.createElement('ds:SignatureValue');
  signatureValueNode.innerHTML = signatureValue;

  // Узел - сертификат 509
  const keyInfoNode = mainXml.createElement('ds:KeyInfo');
  const x509DataNode = mainXml.createElement('ds:X509Data');
  const x509CertificateNode = mainXml.createElement('ds:X509Certificate');
  keyInfoNode.appendChild(x509DataNode);
  x509DataNode.appendChild(x509CertificateNode);
  x509CertificateNode.innerHTML = x509Certificate;
  const signatureNode = mainXml.createElement('ds:Signature');
  signatureNode.setAttribute('xmlns:ds', SIGNATURE_SPEC_NS);
  signatureNode.appendChild(signedInfoNode);
  signatureNode.appendChild(signatureValueNode);
  signatureNode.appendChild(keyInfoNode);
  return signatureNode;
}

// <tb:AttachmentHeaderList>
//   <tb:AttachmentHeader>
//     <tb:contentId>scan.pdf</tb:contentId>
//     <tb:MimeType>application/pdf</tb:MimeType>
//     <tb:SignaturePKCS7>4E/QIOo6aRCi2AgAKzAwnQ==</tb:SignaturePKCS7>
//   </tb:AttachmentHeader>
// </tb:AttachmentHeaderList>
// <t:TestMessage/>
function getFilesNode(mainXml, signedFiles) {
  const attachmentHeaderListNode = mainXml.createElement('tb:AttachmentHeaderList');

  if (signedFiles?.length > 0) {
    for (const signedFile of signedFiles) {
      const attachmentHeaderNode = mainXml.createElement('tb:AttachmentHeader');

      const contentIdNode = mainXml.createElement('tb:contentId');
      const mimeTypeNode = mainXml.createElement('tb:MimeType');
      const signaturePKCS7Node = mainXml.createElement('tb:SignaturePKCS7');

      contentIdNode.innerHTML = signedFile.name;
      mimeTypeNode.innerHTML = 'application/pdf';
      signaturePKCS7Node.innerHTML = signedFile.value;

      attachmentHeaderListNode.appendChild(attachmentHeaderNode);
      attachmentHeaderNode.appendChild(contentIdNode);
      attachmentHeaderNode.appendChild(mimeTypeNode);
      attachmentHeaderNode.appendChild(signaturePKCS7Node);
    }
  }

  return attachmentHeaderListNode;
}

function getTestMessageNode(mainXml) {
  return mainXml.createElement('t:TestMessage');
}
