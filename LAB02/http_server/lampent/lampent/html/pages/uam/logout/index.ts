let ok = false;
try {
  const chinchou = await import("../../../src/chinchou");
  const uamClient = chinchou.createDefaultUamClient();
  const result = await uamClient.result();
  let uamIp: string;
  let uamPort: string;
  if (result === null) {
    uamIp = "192.168.182.1";
    uamPort = "3990";
  } else {
    [uamIp, uamPort] = result;
  }
  const url = new URL(`http://${uamIp}:${uamPort}/logoff`);
  window.location.href = url.href;
  ok = true;
} catch (error) {
  console.error(error);
}

if (!ok) {
  window.location.href = "/";
}
