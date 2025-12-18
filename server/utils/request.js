export async function getBody(req) {
  let data = "";
  for await (const chunk of req) {
    data += chunk;
  }
  return JSON.parse(data);
}