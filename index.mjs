


async function scrapTable(tableNumber) {
  const url = `http://helio.mssl.ucl.ac.uk/helio-vo/solar_activity/arstats/ar_data/nar_${tableNumber}_table.html`;

  const resp = await fetch(url);

  const respText = await resp.text();

  const textLines = respText.split("\n");

  console.log(`Scraped ${textLines.length}`);

  const results = [];
  let tableBegin = false;

  let resultLine = "";

  for (let line of textLines) {
    if (line.includes("<table")) {
      tableBegin = true;
      continue;
    }
    if (tableBegin) {
      if (line.includes("<tr")) {
        resultLine = `${tableNumber},`;
      }
      if (line.includes("<td")) {
        let cellContents = line.substring(
          line.indexOf("<td>") + 4,
          line.indexOf("</td>")
        );
        if (cellContents.includes("<b>")) {
          cellContents = cellContents.substring(
            cellContents.indexOf("<b>") + 3,
            cellContents.indexOf("</b>")
          );
        }
        if (cellContents === "&nbsp;" || cellContents.includes("<a"))
          cellContents = "";
        if (cellContents.includes('"')) {
          cellContents = cellContents.substring(
            cellContents.indexOf('"') + 1,
            cellContents.lastIndexOf('"')
          );
        }
        resultLine += cellContents + ",";
      }
      if (line.includes("</tr>")) {
        results.push(resultLine.slice(0, -1));
      }
    }
    if (line.includes("</table")) {
      break;
    }
  }

  if (results.length > 0) {
    results[0] = results[0].replace(tableNumber, "AR");
  }

  for (let resultLine of results) {
    console.log(resultLine);
  }
}

await scrapTable(13371);

//console.log(respText);
