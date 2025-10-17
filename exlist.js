document.addEventListener('DOMContentLoaded', async () => {
  const listEl = document.getElementById('list');
  listEl.innerHTML = "<p>Cargando excepciones...</p>";

  function diasToTexto(dias) {
    if (!Array.isArray(dias) || dias.length === 0) return "Todos los días";
    const names = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    return dias.map(d => names[d] || d).join(", ");
  }

  async function cargarDesdeGitHub() {
    const url = "https://saeta728.github.io/TuListaFavorita/excepciones.json";
    const resp = await fetch(url, { cache: "no-store" });
    if (!resp.ok) throw new Error("No se pudo cargar desde GitHub");
    return await resp.json();
  }

  async function cargarDesdeLocal() {
    return await chrome.storage.local.get({ excepciones: [], excepcionesHorario: [] });
  }

  try {
    let data;
    // Si estamos dentro de la extensión, usar almacenamiento local
    if (location.protocol === "chrome-extension:") {
      data = await cargarDesdeLocal();
    } else {
      data = await cargarDesdeGitHub();
    }

    const excepciones = data.excepciones || [];
    const excepcionesHorario = data.excepcionesHorario || [];
    listEl.innerHTML = "";

    if ((!excepciones.length) && (!excepcionesHorario.length)) {
      listEl.innerHTML = "<p>No hay excepciones guardadas.</p>";
      return;
    }

    // excepciones normales
    excepciones.forEach(ex => {
      const domainDiv = document.createElement('div');
      domainDiv.className = "domain-block";

      const domainTitle = document.createElement('h2');
      domainTitle.textContent = ex.domain || "(sin dominio)";
      domainDiv.appendChild(domainTitle);

      if (Array.isArray(ex.urls)) {
        const ul = document.createElement('ul');
        ex.urls.forEach(u => {
          if (!u || !u.url) return;
          const li = document.createElement('li');
          const link = document.createElement('a');
          link.href = u.url;
          link.target = "_blank";
          link.textContent = u.title || u.url;
          li.appendChild(link);
          ul.appendChild(li);
        });
        domainDiv.appendChild(ul);
      }
      listEl.appendChild(domainDiv);
    });

    // excepciones con horario
    excepcionesHorario.forEach(ex => {
      const domainDiv = document.createElement('div');
      domainDiv.className = "domain-block";

      const domainTitle = document.createElement('h2');
      domainTitle.textContent = (ex.domain || "(sin dominio)") + " (con horario)";
      domainDiv.appendChild(domainTitle);

      if (Array.isArray(ex.urls)) {
        const ul = document.createElement('ul');
        ex.urls.forEach(u => {
          if (!u || !u.url) return;
          const li = document.createElement('li');
          const link = document.createElement('a');
          link.href = u.url;
          link.target = "_blank";
          link.textContent = u.title || u.url;
          li.appendChild(link);
          ul.appendChild(li);
        });
        domainDiv.appendChild(ul);
      }

      if (Array.isArray(ex.dias) && ex.dias.length > 0) {
        const diasP = document.createElement('p');
        diasP.textContent = "Días: " + diasToTexto(ex.dias);
        domainDiv.appendChild(diasP);
      }

      if (Array.isArray(ex.horarios) && ex.horarios.length > 0) {
        const horasP = document.createElement('p');
        const horasTxt = ex.horarios.map(h => `${h.horaInicio}-${h.horaFin}`).join(", ");
        horasP.textContent = "Horarios: " + horasTxt;
        domainDiv.appendChild(horasP);
      }

      listEl.appendChild(domainDiv);
    });

  } catch (err) {
    console.error("Error cargando excepciones:", err);
    listEl.innerHTML = "<p>Error cargando excepciones.</p>";
  }
});
