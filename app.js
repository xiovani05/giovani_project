// Configuración de contraseñas asignadas a cada rol
const PASSWORDS = {
    acceso1: "admin123",
    acceso2: "chef456",
    acceso3: "staff789"
};

// Estado general de la aplicación
let currentRole = 'public'; 
let activeSectionToEdit = null;

// Datos por defecto (Base de datos local)
let appData = {
    ordenSemanal: ["Lunes: Limpieza profunda e inventario", "Martes: Recepción de verduras y lácteos", "Miércoles: Revisión de menú y mermas", "Jueves: Evento privado nocturno", "Viernes: Preparación alta demanda fin de semana"],
    horarios: ["Juan P. (Cocina): 08:00 a 16:00", "María L. (Salón): 12:00 a 20:00", "Pedro C. (Barra): 16:00 a 00:00"],
    inventario: ["Carne de Res: 20 Kg", "Papas: 45 Kg", "Salsa Tomate: 12 Latas", "Refrescos: 5 Cajas"],
    pendientes: ["Reparar extractor de humos", "Cambiar bombilla del almacén", "Revisar facturas de proveedores"],
    recomendaciones: ["Sugerir el vino de la casa con pastas", "Promocionar el postre especial de limón"]
};

// Títulos y llaves estándar de las secciones
const sectionSpecs = {
    ordenSemanal: { title: "📅 Orden Semanal", key: "ordenSemanal" },
    horarios: { title: "⏰ Cronograma de Horarios", key: "horarios" },
    inventario: { title: "📦 Inventario de Insumos", key: "inventario" },
    pendientes: { title: "📝 Tareas Pendientes", key: "pendientes" },
    recomendaciones: { title: "⭐ Recomendaciones del Chef", key: "recomendaciones" }
};

// REQUERIMIENTO COMPLETO: Distribución, orden y visibilidad según accesos
const layouts = {
    public: ["ordenSemanal", "horarios", "inventario", "pendientes", "recomendaciones"],
    acceso1: ["ordenSemanal", "horarios", "inventario", "pendientes", "recomendaciones"],
    acceso2: ["inventario", "pendientes", "ordenSemanal", "horarios", "recomendaciones"], // Orden alterado y prioritario
    acceso3: ["inventario", "recomendaciones"] // Acceso simple: solo inventario y comentarios
};

// Inicializador automático
window.onload = function() {
    renderPage();
};

// DIBUJAR LA PÁGINA EN PANTALLA
function renderPage() {
    const container = document.getElementById('main-container');
    const roleBadge = document.getElementById('role-badge');
    const btnLogout = document.getElementById('btn-logout');
    const body = document.body;
    const title = document.getElementById('site-title');
    const subtitle = document.getElementById('site-subtitle');

    container.innerHTML = '';
    
    // Configurar interfaces visuales basadas en el nivel de acceso
    if (currentRole === 'public' || currentRole === 'acceso1') {
        body.className = "theme-default";
        title.innerText = "Sabor & Gestión";
        subtitle.innerText = "Panel General del Restaurante";
        roleBadge.innerText = currentRole === 'acceso1' ? "Modo: Administrador (Acceso 1)" : "Vista: Pública";
        roleBadge.className = "badge badge-public";
        if(currentRole === 'acceso1') roleBadge.className = "badge badge-acceso1";
    } else if (currentRole === 'acceso2') {
        body.className = "theme-acceso2";
        title.innerText = "🛠️ Logística Operativa";
        subtitle.innerText = "Modo Supervisor de Planta";
        roleBadge.innerText = "Modo: Supervisor (Acceso 2)";
        roleBadge.className = "badge badge-acceso2";
    } else if (currentRole === 'acceso3') {
        body.className = "theme-acceso3";
        title.innerText = "Terminal de Turno";
        subtitle.innerText = "Uso básico diario de personal";
        roleBadge.innerText = "Modo: Staff Auxiliar (Acceso 3)";
        roleBadge.className = "badge badge-acceso3";
    }

    // Mostrar u ocultar botón de cerrar sesión
    if (currentRole !== 'public') { btnLogout.classList.remove('hidden'); } 
    else { btnLogout.classList.add('hidden'); }

    // Generar dinámicamente las tarjetas permitidas por el rol activo
    layouts[currentRole].forEach(secKey => {
        const spec = sectionSpecs[secKey];
        let displayTitle = spec.title;
        
        // REQUERIMIENTO COMPLETO: Cambio estético de nombre exclusivo para Acceso 3
        if (currentRole === 'acceso3' && secKey === 'recomendaciones') {
            displayTitle = "💬 Comentarios y Notas";
        }

        const card = document.createElement('div');
        card.className = "card";

        // Determinar qué botón de acción colocar
        let actionButton = '';
        if (currentRole === 'public') {
            actionButton = `<button onclick="openAuthModal('${secKey}')" class="secret-trigger">Edición</button>`;
        } else {
            actionButton = `<button onclick="enableSectionEdit('${secKey}')" class="btn-edit-action">Modificar</button>`;
        }

        // Construcción de la lista de elementos
        let listHtml = `<ul>`;
        appData[secKey].forEach((item) => {
            listHtml += `<li>• ${item}</li>`;
        });
        listHtml += `</ul>`;

        card.innerHTML = `
            <div>
                <h2>${displayTitle}</h2>
                ${listHtml}
            </div>
            ${actionButton}
        `;
        container.appendChild(card);
    });
}

// CONTROL DE MODALES DE AUTENTICACIÓN
function openAuthModal(sectionKey) {
    activeSectionToEdit = sectionKey;
    document.getElementById('auth-modal').classList.remove('hidden');
    document.getElementById('modal-password').focus();
}

function closeAuthModal() {
    document.getElementById('auth-modal').classList.add('hidden');
    document.getElementById('modal-password').value = '';
    activeSectionToEdit = null;
}

// PROCESAR CONTRASEÑA INTRODUCIDA
function verifySectionPassword() {
    const pass = document.getElementById('modal-password').value;

    if (pass === PASSWORDS.acceso1) {
        currentRole = 'acceso1';
        closeAuthModal();
        renderPage();
    } else if (pass === PASSWORDS.acceso2) {
        currentRole = 'acceso2';
        closeAuthModal();
        renderPage();
    } else if (pass === PASSWORDS.acceso3) {
        // REQUERIMIENTO COMPLETO: Acceso 3 restringido únicamente a inventarios y recomendaciones (comentarios)
        if (activeSectionToEdit === 'inventario' || activeSectionToEdit === 'recomendaciones') {
            currentRole = 'acceso3';
            closeAuthModal();
            renderPage();
        } else {
            alert("El Acceso 3 no tiene autorización ni visibilidad sobre esta sección.");
        }
    } else {
        alert("Contraseña incorrecta.");
    }
}

// CARGAR FORMULARIO DE EDICIÓN EN LA TARJETA SELECCIONADA
function enableSectionEdit(sectionKey) {
    renderPage(); // Resetea otras posibles ediciones abiertas
    const container = document.getElementById('main-container');
    const cards = container.children;
    const targetIndex = layouts[currentRole].indexOf(sectionKey);
    
    if (targetIndex !== -1) {
        const targetCard = cards[targetIndex];
        let editItemsHtml = `<div style="margin-top: 1rem;">`;
        
        // Inputs editables para cada fila existente
        appData[sectionKey].forEach((item, idx) => {
            editItemsHtml += `
                <div class="edit-form-group">
                    <input type="text" value="${item}" id="edit-${sectionKey}-${idx}">
                    <button onclick="deleteItem('${sectionKey}', ${idx})" class="btn-delete">X</button>
                </div>`;
        });
        
        // Inputs para añadir un registro completamente nuevo
        editItemsHtml += `
            <div class="edit-form-group" style="margin-top: 1rem; pt-1rem; border-top: 1px dashed var(--border-color);">
                <input type="text" placeholder="Añadir nuevo registro..." id="new-${sectionKey}">
                <button onclick="addItem('${sectionKey}')" style="background-color: #16a34a; color:white; border:none; padding: 0 0.75rem; border-radius:4px; cursor:pointer;">+</button>
            </div>
        </div>`;

        targetCard.innerHTML = `
            <div>
                <h2 style="color: #f59e0b;">Panel de Modificación</h2>
                ${editItemsHtml}
            </div>
            <div class="form-actions-footer">
                <button onclick="renderPage()" class="btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.8rem;">Cancelar</button>
                <button onclick="saveSectionChanges('${sectionKey}')" class="btn-primary" style="padding:0.25rem 0.5rem; font-size:0.8rem; background-color:#2563eb;">Guardar Cambios</button>
            </div>
        `;
    }
}

// GUARDAR CAMBIOS EFECTUADOS
function saveSectionChanges(sectionKey) {
    const inputs = document.querySelectorAll(`[id^="edit-${sectionKey}-"]`);
    let updatedList = [];
    inputs.forEach(input => {
        if (input.value.trim() !== "") { 
            updatedList.push(input.value.trim()); 
        }
    });
    appData[sectionKey] = updatedList;
    renderPage();
}

// ACCIONES DE AGREGAR Y ELIMINAR ELEMENTOS
function addItem(sectionKey) {
    const targetInput = document.getElementById(`new-${sectionKey}`);
    if (targetInput && targetInput.value.trim() !== "") {
        appData[sectionKey].push(targetInput.value.trim());
        enableSectionEdit(sectionKey);
    }
}

function deleteItem(sectionKey, idx) {
    appData[sectionKey].splice(idx, 1);
    enableSectionEdit(sectionKey);
}

// LOGOUT / VOLVER A MODO PÚBLICO
function logout() {
    currentRole = 'public';
    renderPage();
}
