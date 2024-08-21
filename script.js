document
  .getElementById("timetableForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const professorSubjectMap = document
      .getElementById("professorSubjectMap")
      .value.split(",")
      .map((pair) => pair.trim().split(":"))
      .reduce((acc, [prof, subj]) => {
        acc[prof.trim()] = subj.trim();
        return acc;
      }, {});

    const days = parseInt(document.getElementById("days").value);
    const hoursPerDay = parseInt(document.getElementById("hoursPerDay").value);
    const timesPerSubject = parseInt(
      document.getElementById("timesPerSubject").value
    );
    const additionalContent =
      document.getElementById("additionalContent").value;

    const timetable = generateTimetable(
      professorSubjectMap,
      days,
      hoursPerDay,
      timesPerSubject
    );

    displayTimetable(timetable, professorSubjectMap, additionalContent);
  });

function generateTimetable(
  professorSubjectMap,
  days = 5,
  hoursPerDay = 5,
  timesPerSubject = 4
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
      const slot = allSlots.pop();
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

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function displayTimetable(timetable, professorSubjectMap, additionalContent) {
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  let output = '<table id="timetableTable" border="1"><thead><tr><th>Day</th>';

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
  document.getElementById("timetableOutput").innerHTML = output;

  const downloadButton = document.createElement("button");
  downloadButton.textContent = "Download as PDF";
  downloadButton.addEventListener("click", () =>
    downloadPDF(professorSubjectMap, additionalContent)
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

function downloadPDF(professorSubjectMap, additionalContent) {
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

    let legendY = currentY;

    doc.autoTable({
      html: timetableTable,
      startY: legendY,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
    });

    doc.save("timetable.pdf");
  } else {
    alert("No timetable to download.");
  }
}
