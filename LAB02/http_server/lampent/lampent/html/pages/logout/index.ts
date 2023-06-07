try {
  const chinchou = await import("../../src/chinchou");
  const mainClient = chinchou.createDefaultMainClient();
  await mainClient.logout();
} catch (error) {
  console.error(error);
}

window.location.href = "/";
