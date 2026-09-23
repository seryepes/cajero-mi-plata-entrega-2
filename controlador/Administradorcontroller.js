// Capa: Presentación
// Controla el panel del rol Administrador: resumen general, gestión de
// usuarios (bloquear/desbloquear) y gestión de cajeros (crear/eliminar).

export class AdministradorController {
    constructor(banco, notificador) {
        this.banco = banco;
        this.notificador = notificador;
        this.formatoMoneda = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

        this.el = {
            tabs: document.querySelectorAll("#viewAdministrador .action-tab"),
            panelResumen: document.getElementById("adminPanelResumen"),
            panelUsuarios: document.getElementById("adminPanelUsuarios"),
            panelCajeros: document.getElementById("adminPanelCajeros"),

            statUsuarios: document.getElementById("statUsuarios"),
            statCajeros: document.getElementById("statCajeros"),
            statSaldo: document.getElementById("statSaldo"),
            statMovimientos: document.getElementById("statMovimientos"),
            statBloqueados: document.getElementById("statBloqueados"),

            tablaUsuarios: document.getElementById("tablaUsuarios"),
            usuariosEmpty: document.getElementById("usuariosEmpty"),

            tablaCajeros: document.getElementById("tablaCajeros"),
            cajerosEmpty: document.getElementById("cajerosEmpty"),
            formCrearCajero: document.getElementById("formCrearCajero"),
            crearCajeroError: document.getElementById("crearCajeroError")
        };

        this.el.tabs.forEach(tab => tab.addEventListener("click", () => this.cambiarTab(tab.dataset.adminTab)));
        this.el.formCrearCajero.addEventListener("submit", e => this.manejarCrearCajero(e));
    }

    activarPara(administrador) {
        this.administrador = administrador;
        this.cambiarTab("resumen");
    }

    cambiarTab(tab) {
        this.el.tabs.forEach(t => t.classList.toggle("active", t.dataset.adminTab === tab));
        this.el.panelResumen.classList.toggle("hidden", tab !== "resumen");
        this.el.panelUsuarios.classList.toggle("hidden", tab !== "usuarios");
        this.el.panelCajeros.classList.toggle("hidden", tab !== "cajeros");

        if (tab === "resumen") this.renderizarResumen();
        if (tab === "usuarios") this.renderizarUsuarios();
        if (tab === "cajeros") this.renderizarCajeros();
    }

    renderizarResumen() {
        const reporte = this.administrador.generarReporteGeneral(this.banco);
        this.el.statUsuarios.textContent = reporte.totalUsuarios;
        this.el.statCajeros.textContent = reporte.totalCajeros;
        this.el.statSaldo.textContent = this.formatoMoneda.format(reporte.saldoTotal);
        this.el.statMovimientos.textContent = reporte.totalMovimientos;
        this.el.statBloqueados.textContent = reporte.usuariosBloqueados;
    }

    renderizarUsuarios() {
        const usuarios = this.banco.listarUsuarios();
        this.el.tablaUsuarios.innerHTML = "";

        if (usuarios.length === 0) {
            this.el.usuariosEmpty.classList.remove("hidden");
            return;
        }
        this.el.usuariosEmpty.classList.add("hidden");

        usuarios.forEach(usuario => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${usuario.nombre}</td>
                <td>${usuario.id}</td>
                <td>${this.formatoMoneda.format(usuario.saldo)}</td>
                <td><span class="tag ${usuario.activo ? "activo" : "bloqueado"}">${usuario.activo ? "Activa" : "Bloqueada"}</span></td>
                <td></td>
            `;

            const celdaAccion = fila.querySelector("td:last-child");
            const boton = document.createElement("button");
            boton.className = usuario.activo ? "btn btn-danger btn-sm" : "btn btn-ghost btn-sm";
            boton.textContent = usuario.activo ? "Bloquear" : "Desbloquear";
            boton.addEventListener("click", () => this.alternarBloqueo(usuario));
            celdaAccion.appendChild(boton);

            this.el.tablaUsuarios.appendChild(fila);
        });
    }

    alternarBloqueo(usuario) {
        if (usuario.activo) {
            this.administrador.bloquearUsuario(usuario);
            this.notificador.mostrar(`Cuenta de ${usuario.nombre} bloqueada.`, "error");
        } else {
            this.administrador.desbloquearUsuario(usuario);
            this.notificador.mostrar(`Cuenta de ${usuario.nombre} desbloqueada.`);
        }
        this.banco.persistirUsuarios();
        this.renderizarUsuarios();
    }

    renderizarCajeros() {
        const cajeros = this.banco.listarCajeros();
        this.el.tablaCajeros.innerHTML = "";

        if (cajeros.length === 0) {
            this.el.cajerosEmpty.classList.remove("hidden");
            return;
        }
        this.el.cajerosEmpty.classList.add("hidden");

        cajeros.forEach(cajero => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${cajero.nombre}</td>
                <td>${cajero.codigoEmpleado}</td>
                <td>${cajero.correo}</td>
                <td></td>
            `;

            const celdaAccion = fila.querySelector("td:last-child");
            const boton = document.createElement("button");
            boton.className = "btn btn-danger btn-sm";
            boton.textContent = "Eliminar";
            boton.addEventListener("click", () => this.eliminarCajero(cajero));
            celdaAccion.appendChild(boton);

            this.el.tablaCajeros.appendChild(fila);
        });
    }

    eliminarCajero(cajero) {
        this.administrador.eliminarCajero(this.banco, cajero.id);
        this.notificador.mostrar(`Cajero ${cajero.nombre} eliminado.`);
        this.renderizarCajeros();
    }

    manejarCrearCajero(e) {
        e.preventDefault();
        const nombre = document.getElementById("cajeroNombre").value.trim();
        const id = document.getElementById("cajeroId").value.trim();
        const correo = document.getElementById("cajeroCorreo").value.trim();
        const contrasenia = document.getElementById("cajeroContrasenia").value;
        const codigoEmpleado = document.getElementById("cajeroCodigo").value.trim();

        const resultado = this.administrador.crearCajero(this.banco, { nombre, id, correo, contrasenia, codigoEmpleado });
        if (!resultado.exito) {
            this.el.crearCajeroError.textContent = resultado.mensaje;
            return;
        }

        this.el.crearCajeroError.textContent = "";
        this.el.formCrearCajero.reset();
        this.notificador.mostrar(`Cajero ${resultado.persona.nombre} creado.`);
        this.renderizarCajeros();
    }
}