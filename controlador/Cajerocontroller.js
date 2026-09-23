// Capa: Presentación
// Controla el panel del rol Cajero: buscar un cliente y operar su cuenta
// en su nombre (todo pasa por los métodos de la clase Cajero, nunca
// directo sobre Cuenta, para que quede el rastro de auditoría).

export class CajeroController {
    constructor(banco, notificador) {
        this.banco = banco;
        this.notificador = notificador;
        this.clienteActual = null;
        this.formatoMoneda = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

        this.el = {
            busqueda: document.getElementById("cajeroBusqueda"),
            btnBuscar: document.getElementById("btnBuscarCliente"),
            busquedaError: document.getElementById("cajeroBusquedaError"),
            clienteCard: document.getElementById("clienteCard"),
            clienteNombre: document.getElementById("clienteNombre"),
            clienteEstado: document.getElementById("clienteEstado"),
            clienteSaldo: document.getElementById("clienteSaldo"),
            montoRetiro: document.getElementById("clienteMontoRetiro"),
            montoConsignacion: document.getElementById("clienteMontoConsignacion"),
            btnRetirar: document.getElementById("btnClienteRetirar"),
            btnConsignar: document.getElementById("btnClienteConsignar"),
            operacionError: document.getElementById("clienteOperacionError"),
            movimientosPanel: document.getElementById("clienteMovimientosPanel"),
            lista: document.getElementById("clienteListaMovimientos"),
            vacio: document.getElementById("clienteEmptyMovimientos")
        };

        this.el.btnBuscar.addEventListener("click", () => this.buscarCliente());
        this.el.busqueda.addEventListener("keydown", e => { if (e.key === "Enter") this.buscarCliente(); });
        this.el.btnRetirar.addEventListener("click", () => this.manejarRetiro());
        this.el.btnConsignar.addEventListener("click", () => this.manejarConsignacion());
    }

    activarPara(cajero) {
        this.cajero = cajero;
        this.limpiar();
    }

    limpiar() {
        this.clienteActual = null;
        this.el.busqueda.value = "";
        this.el.busquedaError.textContent = "";
        this.el.clienteCard.classList.add("hidden");
        this.el.movimientosPanel.classList.add("hidden");
    }

    buscarCliente() {
        const criterio = this.el.busqueda.value.trim();
        if (!criterio) {
            this.el.busquedaError.textContent = "Escribe un nombre o número de identificación.";
            return;
        }

        const cliente = this.banco.buscarUsuario(criterio);
        if (!cliente) {
            this.el.busquedaError.textContent = "No se encontró ningún cliente con ese dato.";
            this.el.clienteCard.classList.add("hidden");
            this.el.movimientosPanel.classList.add("hidden");
            return;
        }

        this.el.busquedaError.textContent = "";
        this.clienteActual = cliente;
        this.renderizarCliente();
    }

    renderizarCliente() {
        const cliente = this.clienteActual;
        this.el.clienteNombre.textContent = cliente.nombre;
        this.el.clienteSaldo.textContent = this.formatoMoneda.format(cliente.saldo);
        this.el.clienteEstado.textContent = cliente.activo ? "Cuenta activa" : "Cuenta bloqueada";
        this.el.clienteEstado.classList.toggle("bloqueado", !cliente.activo);
        this.el.clienteCard.classList.remove("hidden");
        this.el.operacionError.textContent = "";

        this.el.movimientosPanel.classList.remove("hidden");
        this.renderizarMovimientos();
    }

    manejarRetiro() {
        const monto = Number(this.el.montoRetiro.value);
        if (this.cajero.atenderRetiro(this.clienteActual, monto)) {
            this.banco.persistirUsuarios();
            this.el.montoRetiro.value = "";
            this.el.operacionError.textContent = "";
            this.renderizarCliente();
            this.notificador.mostrar(`Retiro de ${this.formatoMoneda.format(monto)} realizado para ${this.clienteActual.nombre}.`);
        } else {
            this.el.operacionError.textContent = "No se pudo retirar: verifica el monto o si la cuenta está bloqueada.";
        }
    }

    manejarConsignacion() {
        const monto = Number(this.el.montoConsignacion.value);
        if (this.cajero.atenderConsignacion(this.clienteActual, monto)) {
            this.banco.persistirUsuarios();
            this.el.montoConsignacion.value = "";
            this.el.operacionError.textContent = "";
            this.renderizarCliente();
            this.notificador.mostrar(`Consignación de ${this.formatoMoneda.format(monto)} realizada para ${this.clienteActual.nombre}.`);
        } else {
            this.el.operacionError.textContent = "Ingresa un monto numérico y positivo.";
        }
    }

    renderizarMovimientos() {
        this.el.lista.innerHTML = "";
        const movimientos = this.clienteActual.movimientos;

        if (movimientos.length === 0) {
            this.el.vacio.classList.remove("hidden");
            return;
        }
        this.el.vacio.classList.add("hidden");

        movimientos.forEach(mov => {
            const esConsignacion = mov.tipo === "Consignación";
            const fecha = mov.fecha instanceof Date ? mov.fecha : new Date(mov.fecha);

            const li = document.createElement("li");
            li.className = "movement-row";
            li.innerHTML = `
                <span class="movement-icon ${esConsignacion ? "in" : "out"}">${esConsignacion ? "↓" : "↑"}</span>
                <span>
                    <div class="movement-type">${mov.tipo}</div>
                    <div class="movement-responsable">Por: ${mov.responsable}</div>
                    <div class="movement-date">${fecha.toLocaleString("es-CO")}</div>
                </span>
                <span>
                    <div class="movement-amount ${esConsignacion ? "in" : "out"}">${esConsignacion ? "+" : "-"}${this.formatoMoneda.format(mov.monto)}</div>
                    <div class="movement-balance">Saldo: ${this.formatoMoneda.format(mov.saldo)}</div>
                </span>
            `;
            this.el.lista.appendChild(li);
        });
    }
}