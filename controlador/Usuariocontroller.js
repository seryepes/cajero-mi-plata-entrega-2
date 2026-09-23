// Capa: Presentación
// Controla el dashboard del rol Usuario: saldo, retiros, consignaciones
// y el historial de movimientos.

export class UsuarioController {
    constructor(banco, notificador) {
        this.banco = banco;
        this.notificador = notificador;
        this.formatoMoneda = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

        this.el = {
            saldo: document.getElementById("usuarioSaldo"),
            tabs: document.querySelectorAll("#viewUsuario .action-tab"),
            panelRetirar: document.getElementById("usuarioPanelRetirar"),
            panelConsignar: document.getElementById("usuarioPanelConsignar"),
            panelMovimientos: document.getElementById("usuarioPanelMovimientos"),
            formRetirar: document.getElementById("formRetirar"),
            formConsignar: document.getElementById("formConsignar"),
            retirarError: document.getElementById("retirarError"),
            consignarError: document.getElementById("consignarError"),
            lista: document.getElementById("usuarioListaMovimientos"),
            vacio: document.getElementById("usuarioEmptyMovimientos")
        };

        this.el.tabs.forEach(tab => tab.addEventListener("click", () => this.cambiarTab(tab.dataset.action)));
        this.el.formRetirar.addEventListener("submit", e => this.manejarRetiro(e));
        this.el.formConsignar.addEventListener("submit", e => this.manejarConsignacion(e));
    }

    // Se llama cada vez que este usuario entra al dashboard.
    activarPara(usuario) {
        this.usuario = usuario;
        this.actualizarSaldo();
        this.cambiarTab("retirar");
    }

    cambiarTab(accion) {
        this.el.tabs.forEach(t => t.classList.toggle("active", t.dataset.action === accion));
        this.el.panelRetirar.classList.toggle("hidden", accion !== "retirar");
        this.el.panelConsignar.classList.toggle("hidden", accion !== "consignar");
        this.el.panelMovimientos.classList.toggle("hidden", accion !== "movimientos");
        if (accion === "movimientos") this.renderizarMovimientos();
    }

    actualizarSaldo() {
        this.el.saldo.textContent = this.formatoMoneda.format(this.usuario.saldo);
    }

    manejarRetiro(e) {
        e.preventDefault();
        const input = document.getElementById("retirarMonto");
        const cantidad = Number(input.value);

        if (this.usuario.retirar(cantidad)) {
            this.banco.persistirUsuarios();
            this.actualizarSaldo();
            this.el.retirarError.textContent = "";
            input.value = "";
            this.notificador.mostrar(`Retiraste ${this.formatoMoneda.format(cantidad)}.`);
        } else {
            this.el.retirarError.textContent = "No tienes saldo suficiente o el monto no es válido.";
        }
    }

    manejarConsignacion(e) {
        e.preventDefault();
        const input = document.getElementById("consignarMonto");
        const cantidad = Number(input.value);

        if (this.usuario.consignar(cantidad)) {
            this.banco.persistirUsuarios();
            this.actualizarSaldo();
            this.el.consignarError.textContent = "";
            input.value = "";
            this.notificador.mostrar(`Consignaste ${this.formatoMoneda.format(cantidad)}.`);
        } else {
            this.el.consignarError.textContent = "Ingresa un monto numérico y positivo.";
        }
    }

    renderizarMovimientos() {
        this.el.lista.innerHTML = "";
        const movimientos = this.usuario.movimientos;

        if (movimientos.length === 0) {
            this.el.vacio.classList.remove("hidden");
            return;
        }
        this.el.vacio.classList.add("hidden");

        movimientos.forEach(mov => this.el.lista.appendChild(this.crearFilaMovimiento(mov)));
    }

    crearFilaMovimiento(mov) {
        const esConsignacion = mov.tipo === "Consignación";
        const fecha = mov.fecha instanceof Date ? mov.fecha : new Date(mov.fecha);

        const li = document.createElement("li");
        li.className = "movement-row";
        li.innerHTML = `
            <span class="movement-icon ${esConsignacion ? "in" : "out"}">${esConsignacion ? "↓" : "↑"}</span>
            <span>
                <div class="movement-type">${mov.tipo}</div>
                <div class="movement-date">${fecha.toLocaleString("es-CO")}</div>
            </span>
            <span>
                <div class="movement-amount ${esConsignacion ? "in" : "out"}">${esConsignacion ? "+" : "-"}${this.formatoMoneda.format(mov.monto)}</div>
                <div class="movement-balance">Saldo: ${this.formatoMoneda.format(mov.saldo)}</div>
            </span>
        `;
        return li;
    }
}