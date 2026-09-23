// Capa: Presentación
// Controla el formulario de autenticación (login + registro de Usuario).
// No sabe nada de saldos ni movimientos: solo entra/crea cuentas y avisa
// al AppController cuándo hay una sesión lista para abrir.

export class AuthController {
    constructor(banco, notificador, onIngreso) {
        this.banco = banco;
        this.notificador = notificador;
        this.onIngreso = onIngreso; // callback(persona, rol)

        this.el = {
            tabs: document.querySelectorAll(".auth-tab"),
            formLogin: document.getElementById("formLogin"),
            formRegister: document.getElementById("formRegister"),
            loginError: document.getElementById("loginError"),
            registerError: document.getElementById("registerError")
        };

        this.el.tabs.forEach(tab => tab.addEventListener("click", () => this.cambiarTab(tab.dataset.tab)));
        this.el.formLogin.addEventListener("submit", e => this.manejarLogin(e));
        this.el.formRegister.addEventListener("submit", e => this.manejarRegistro(e));
    }

    mostrarTabInicial() {
        this.cambiarTab("login");
    }

    cambiarTab(tab) {
        this.el.tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === tab));
        this.el.formLogin.classList.toggle("hidden", tab !== "login");
        this.el.formRegister.classList.toggle("hidden", tab !== "register");
        this.el.loginError.textContent = "";
        this.el.registerError.textContent = "";
    }

    manejarLogin(e) {
        e.preventDefault();
        const nombre = document.getElementById("loginNombre").value.trim();
        const contrasenia = document.getElementById("loginContrasenia").value;

        const resultado = this.banco.autenticar(nombre, contrasenia);
        if (!resultado) {
            this.el.loginError.textContent = "Nombre o contraseña incorrectos.";
            return;
        }

        this.el.loginError.textContent = "";
        this.el.formLogin.reset();
        this.notificador.mostrar(`Bienvenido, ${resultado.persona.nombre}.`);
        this.onIngreso(resultado.persona, resultado.rol);
    }

    manejarRegistro(e) {
        e.preventDefault();
        const nombre = document.getElementById("regNombre").value.trim();
        const id = document.getElementById("regId").value.trim();
        const correo = document.getElementById("regCorreo").value.trim();
        const contrasenia = document.getElementById("regContrasenia").value;
        const repetir = document.getElementById("regContraseniaRepetir").value;
        const saldoInicial = Number(document.getElementById("regSaldo").value);
        const producto = document.getElementById("regProducto").value;

        if (contrasenia !== repetir) {
            this.el.registerError.textContent = "Las contraseñas no coinciden.";
            return;
        }
        if (!Number.isFinite(saldoInicial) || saldoInicial < 0) {
            this.el.registerError.textContent = "El depósito inicial debe ser un número válido.";
            return;
        }

        const resultado = this.banco.registrarUsuario({ nombre, id, correo, contrasenia, saldoInicial, producto });
        if (!resultado.exito) {
            this.el.registerError.textContent = resultado.mensaje;
            return;
        }

        this.el.registerError.textContent = "";
        this.el.formRegister.reset();
        this.notificador.mostrar(`Cuenta creada. ¡Bienvenido, ${resultado.persona.nombre}!`);
        this.onIngreso(resultado.persona, "usuario");
    }
}