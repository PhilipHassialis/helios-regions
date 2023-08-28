async function getTableNumbers() {

    const allNumsURL = `http://helio.mssl.ucl.ac.uk/helio-vo/solar_activity/arstats/`;
    const resp = await fetch(allNumsURL);
    const respText = await resp.text();
    const textLines = respText.split("\n");
    const arNumbers = [];
    const startMark = "Active Region ";

    for (let line of textLines) {
        if (line.includes("<b>")) {
            arNumbers.push(line.substring(line.indexOf(startMark)+startMark.length, line.indexOf("</b>")));
        } 
    }

    console.log(`Found total ${arNumbers.length} regions`);

    for (let arNumber of arNumbers) {
        await scrapTable(arNumber)
    }
}


async function scrapTable(arNumber) {
  const url = `http://helio.mssl.ucl.ac.uk/helio-vo/solar_activity/arstats/ar_data/nar_${arNumber}_table.html`;
  const resp = await fetch(url);
  const respText = await resp.text();
  const textLines = respText.split("\n");

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
        resultLine = `${arNumber},`;
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
    results[0] = results[0].replace(arNumber, "AR");
  }

  for (let resultLine of results) {
    console.log(resultLine);
  }
}

await getTableNumbers();

