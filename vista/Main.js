// Capa: Presentación (orquestador)
// Punto de entrada: crea el Banco y la Sesion, instancia los controladores
// y decide qué vista mostrar según el rol de quien inicia sesión.

import { Banco } from "../servicios/banco.js";
import { Sesion } from "../servicios/secion.js";
import { Notificador } from "../controlador/Notificador.js";
import { AuthController } from "../controlador/Authcontroller.js";
import { UsuarioController } from "../controlador/Usuariocontroller.js";
import { CajeroController } from "../controlador/Cajerocontroller.js";
import { AdministradorController } from "../controlador/Administradorcontroller.js";

class AppController {
    constructor() {
        this.banco = new Banco();
        this.sesion = new Sesion();
        this.notificador = new Notificador();

        this.vistas = {
            auth: document.getElementById("viewAuth"),
            usuario: document.getElementById("viewUsuario"),
            cajero: document.getElementById("viewCajero"),
            administrador: document.getElementById("viewAdministrador")
        };
        this.topbarActions = document.getElementById("topbarActions");
        this.configurarProductos();

        this.authController = new AuthController(this.banco, this.notificador, (persona, rol) => this.entrar(persona, rol));
        this.usuarioController = new UsuarioController(this.banco, this.notificador);
        this.cajeroController = new CajeroController(this.banco, this.notificador);
        this.administradorController = new AdministradorController(this.banco, this.notificador);

        this.authController.mostrarTabInicial();
        this.abrirIngresoDesdeHash();
    }

    configurarProductos() {
        document.querySelectorAll(".product-select").forEach(boton => {
            boton.addEventListener("click", () => {
                const producto = document.getElementById("regProducto");
                producto.value = boton.dataset.producto;
                this.authController.cambiarTab("register");
                document.getElementById("ingreso").scrollIntoView({ behavior: "smooth" });
            });
        });
    }

    abrirIngresoDesdeHash() {
        if (window.location.hash === "#ingreso") {
            this.authController.cambiarTab("login");
            requestAnimationFrame(() => document.getElementById("ingreso").scrollIntoView({ behavior: "smooth" }));
        }
    }

    entrar(persona, rol) {
        this.sesion.iniciar(persona, rol);
        this.mostrarSoloVista(rol);
        this.renderizarTopbar();

        if (rol === "usuario") this.usuarioController.activarPara(persona);
        if (rol === "cajero") this.cajeroController.activarPara(persona);
        if (rol === "administrador") this.administradorController.activarPara(persona);
    }

    salir() {
        this.sesion.cerrar();
        this.mostrarSoloVista("auth");
        this.topbarActions.innerHTML = "";
        this.authController.mostrarTabInicial();
        this.notificador.mostrar("Sesión cerrada.");
    }

    mostrarSoloVista(clave) {
        Object.entries(this.vistas).forEach(([nombre, elemento]) => {
            elemento.classList.toggle("hidden", nombre !== clave);
        });
    }

    renderizarTopbar() {
        const persona = this.sesion.personaActual;
        const rol = this.sesion.rolActual;
        const etiquetas = { usuario: "Cliente", cajero: "Cajero", administrador: "Administrador" };

        this.topbarActions.innerHTML = "";

        const badge = document.createElement("span");
        badge.className = "badge-rol";
        badge.textContent = etiquetas[rol];

        const saludo = document.createElement("span");
        saludo.className = "greeting";
        saludo.innerHTML = `Hola, <strong>${persona.nombre}</strong>`;

        const btnSalir = document.createElement("button");
        btnSalir.className = "btn btn-ghost";
        btnSalir.textContent = "Cerrar sesión";
        btnSalir.addEventListener("click", () => this.salir());

        this.topbarActions.append(badge, saludo, btnSalir);
    }
}

document.addEventListener("DOMContentLoaded", () => new AppController());