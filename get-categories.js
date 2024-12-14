const config = require("./config.json");
const fs = require("fs");
let categories = [];

(async () => {
  const response = await wpApi();
  categories = categories.concat(response.data);
  let page = 1;
  while (response.totalPages > 1 && page < response.totalPages) {
    const nextPage = ++page;
    const nextResponse = await wpApi(nextPage);
    categories = categories.concat(nextResponse.data);
  }

  // write to file
  const timestamp = new Date()
    .toISOString()
    .replace(/:/g, "")
    .replace(/\./g, "");
  const fileName = timestamp + ".json";
  const file = fs.createWriteStream("./artifacts/json/categories/" + fileName);
  file.write(JSON.stringify(categories, null, 2));
  file.end();
})();

async function wpApi(page) {
  const response = await fetch(
    config.siteUrl +
      "/wp-json/wp/v2/categories?per_page=100" +
      (page ? "&page=" + page : ""),
    {
      method: "GET",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(config.username + ":" + config.password).toString(
            "base64"
          ),
      },
    }
  );
  const data = await response.json();
  const totalPages = response.headers.get("x-wp-totalpages");
  return { data: data, totalPages: totalPages };
}
