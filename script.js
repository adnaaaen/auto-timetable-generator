document
  .getElementById("timetableForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    document.getElementById("timetableOutput").innerHTML = "";

    // Batch 1 Inputs
    const professorSubjectMapBatch1 = getProfessorSubjectMap(
      "professorSubjectMapBatch1"
    );
    const daysBatch1 = parseInt(document.getElementById("daysBatch1").value);
    const hoursPerDayBatch1 = parseInt(
      document.getElementById("hoursPerDayBatch1").value
    );
    const timesPerSubjectBatch1 = parseInt(
      document.getElementById("timesPerSubjectBatch1").value
    );
    const additionalContentBatch1 = document.getElementById(
      "additionalContentBatch1"
    ).value;

    // Batch 2 Inputs
    const professorSubjectMapBatch2 = getProfessorSubjectMap(
      "professorSubjectMapBatch2"
    );
    const daysBatch2 = parseInt(document.getElementById("daysBatch2").value);
    const hoursPerDayBatch2 = parseInt(
      document.getElementById("hoursPerDayBatch2").value
    );
    const timesPerSubjectBatch2 = parseInt(
      document.getElementById("timesPerSubjectBatch2").value
    );
    const additionalContentBatch2 = document.getElementById(
      "additionalContentBatch2"
    ).value;

    // Batch 3 Inputs
    const professorSubjectMapBatch3 = getProfessorSubjectMap(
      "professorSubjectMapBatch3"
    );
    const daysBatch3 = parseInt(document.getElementById("daysBatch3").value);
    const hoursPerDayBatch3 = parseInt(
      document.getElementById("hoursPerDayBatch3").value
    );
    const timesPerSubjectBatch3 = parseInt(
      document.getElementById("timesPerSubjectBatch3").value
    );
    const additionalContentBatch3 = document.getElementById(
      "additionalContentBatch3"
    ).value;

    // Generate Timetables for Each Batch
    const timetableBatch1 = generateTimetable(
      professorSubjectMapBatch1,
      daysBatch1,
      hoursPerDayBatch1,
      timesPerSubjectBatch1
    );
    const timetableBatch2 = generateTimetable(
      professorSubjectMapBatch2,
      daysBatch2,
      hoursPerDayBatch2,
      timesPerSubjectBatch2,
      timetableBatch1
    );
    const timetableBatch3 = generateTimetable(
      professorSubjectMapBatch3,
      daysBatch3,
      hoursPerDayBatch3,
      timesPerSubjectBatch3,
      timetableBatch1.concat(timetableBatch2)
    );

    // Display Timetables for Each Batch
    displayTimetable(
      timetableBatch1,
      professorSubjectMapBatch1,
      additionalContentBatch1,
      "Batch 1"
    );
    displayTimetable(
      timetableBatch2,
      professorSubjectMapBatch2,
      additionalContentBatch2,
      "Batch 2"
    );
    displayTimetable(
      timetableBatch3,
      professorSubjectMapBatch3,
      additionalContentBatch3,
      "Batch 3"
    );
  });

function getProfessorSubjectMap(id) {
  return document
    .getElementById(id)
    .value.split(",")
    .map((pair) => pair.trim().split(":"))
    .reduce((acc, [prof, subj]) => {
      acc[prof.trim()] = subj.trim();
      return acc;
    }, {});
}

function generateTimetable(
  professorSubjectMap,
  days = 5,
  hoursPerDay = 5,
  timesPerSubject = 4,
  existingTimetables = []
) {
  const subjects = Object.values(professorSubjectMap);
  const professors = Object.keys(professorSubjectMap);
  const timetable = Array.from({ length: days }, () =>
    Array.from({ length: hoursPerDay }, () => ({}))
  );

  const subjectHours = subjects.flatMap((subject) =>
    Array(timesPerSubject).fill(subject)
  );
  const totalSlots = days * hoursPerDay;
  const freeHoursCount = totalSlots - subjectHours.length;

  const allSlots = [
    ...subjectHours,
    ...Array(freeHoursCount).fill("Free Hour"),
  ];
  shuffleArray(allSlots);

  for (let day = 0; day < days; day++) {
    for (let hour = 0; hour < hoursPerDay; hour++) {
      let slot;
      do {
        slot = allSlots.pop();
      } while (
        isProfessorOccupied(
          day,
          hour,
          professorSubjectMap,
          slot,
          existingTimetables
        )
      );

      if (slot === "Free Hour") {
        timetable[day][hour] = { subject: "Free Hour", professor: "Free Hour" };
      } else {
        const professor = professors.find(
          (prof) => professorSubjectMap[prof] === slot
        );
        timetable[day][hour] = { subject: slot, professor: professor };
      }
    }
  }

  return timetable;
}

function isProfessorOccupied(
  day,
  hour,
  professorSubjectMap,
  slot,
  existingTimetables
) {
  if (slot === "Free Hour") return false;

  const professor = Object.keys(professorSubjectMap).find(
    (prof) => professorSubjectMap[prof] === slot
  );

  return existingTimetables.some((timetable) => {
    return (
      timetable[day] &&
      timetable[day][hour] &&
      timetable[day][hour].professor === professor
    );
  });
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function displayTimetable(
  timetable,
  professorSubjectMap,
  additionalContent,
  batchName
) {
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  let output = `<h2>${batchName}</h2><table id="timetableTable" border="1"><thead><tr><th>Day</th>`;

  for (let i = 1; i <= timetable[0].length; i++) {
    output += `<th>${i}</th>`;
  }
  output += "</tr></thead><tbody>";

  timetable.forEach((day, dayIndex) => {
    output += `<tr><td>${daysOfWeek[dayIndex] || "Day " + (dayIndex + 1)}</td>`;
    day.forEach((slot) => {
      output += `<td contenteditable="true" data-subject="${
        slot.subject
      }" data-professor="${
        slot.professor
      }" style="background-color: ${getColorForProfessor(slot.professor)}">${
        slot.subject
      } (${slot.professor})</td>`;
    });
    output += "</tr>";
  });

  output += "</tbody></table>";
  document.getElementById("timetableOutput").innerHTML += output;

  const downloadButton = document.createElement("button");
  downloadButton.textContent = "Download " + batchName + " as PDF";
  downloadButton.addEventListener("click", () =>
    downloadPDF(professorSubjectMap, additionalContent, batchName)
  );
  document.getElementById("timetableOutput").appendChild(downloadButton);
}

function getColorForProfessor(professor) {
  const hash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  };

  const intToColor = (int) => {
    const r = ((int >> 16) & 0xff) * 0.5;
    const g = ((int >> 8) & 0xff) * 0.5;
    const b = (int & 0xff) * 0.5;
    return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
  };

  const colorValue = hash(professor) & 0xffffff;
  return intToColor(colorValue);
}

function downloadPDF(professorSubjectMap, additionalContent, batchName) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const timetableTable = document.getElementById("timetableTable");

  if (timetableTable) {
    let currentY = 10;

    if (additionalContent) {
      doc.setFontSize(16);
      doc.text(additionalContent, 10, currentY);
      currentY += 10;
    }

    doc.autoTable({
      html: timetableTable,
      startY: currentY,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
    });

    doc.save(batchName + "-timetable.pdf");
  } else {
    alert("No timetable to download.");
  }
}
