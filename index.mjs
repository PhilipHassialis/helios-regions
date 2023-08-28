import fs from "fs";

const OUTPUTFILE = "output.csv";

async function getTableNumbers() {
  const allNumsURL = `http://helio.mssl.ucl.ac.uk/helio-vo/solar_activity/arstats/`;
  const resp = await fetch(allNumsURL);
  const respText = await resp.text();
  const textLines = respText.split("\n");
  const arNumbers = [];
  const startMark = "Active Region ";

  for (let line of textLines) {
    if (line.includes("<b>")) {
      arNumbers.push(
        line.substring(
          line.indexOf(startMark) + startMark.length,
          line.indexOf("</b>")
        )
      );
    }
  }

  console.log(`Found total ${arNumbers.length} regions`);

  fs.writeFileSync(
    OUTPUTFILE,
    "AR,DATE,TYP,AREA,NSPOT,ZMCINT,MCLASS,C,M,X,TOTAL,SMON\n"
  );

  for (let arNumber of arNumbers) {
    await scrapTable(arNumber);
  }
}

async function scrapTable(arNumber) {
  console.log(`Processing Active Region ${arNumber}`);
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

  results.splice(0,1);

  for (let resultLine of results) {
    fs.appendFileSync(OUTPUTFILE, `${resultLine}\n`);
  }
}

await getTableNumbers();
