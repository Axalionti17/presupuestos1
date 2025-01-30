interface Transaccion {
    descripcion: string;
    monto: number;
    tipo: "ingreso" | "gasto";
    fecha: string;
}

class GestorTransacciones {
    private transacciones: Transaccion[] = [];
    private saldoActual: number = 0;

    constructor() {
        this.cargarDatos();
        this.inicializarEventos();
    }

    private cargarDatos(): void {
        const datosGuardados = localStorage.getItem('transacciones');
        if (datosGuardados) {
            this.transacciones = JSON.parse(datosGuardados);
            this.calcularSaldoActual();
        }
        this.actualizarUI();
    }

    private calcularSaldoActual(): void {
        this.saldoActual = this.transacciones.reduce((total, t) => {
            return total + (t.tipo === 'ingreso' ? t.monto : -t.monto);
        }, 0);
    }

    private inicializarEventos(): void {
        const btnIngreso = document.getElementById('btn-ingreso');
        const btnGasto = document.getElementById('btn-gasto');
        const descripcionInput = document.getElementById('descripcion') as HTMLInputElement;

        btnIngreso?.addEventListener('click', () => this.procesarTransaccion('ingreso'));
        btnGasto?.addEventListener('click', () => this.procesarTransaccion('gasto'));

        // Validación en tiempo real para la descripción
        descripcionInput?.addEventListener('input', (e) => {
            const input = e.target as HTMLInputElement;
            // Reemplazar cualquier carácter que no sea letra o espacio
            input.value = input.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
            this.validarDescripcion(input);
        });
    }

    private validarDescripcion(input: HTMLInputElement): boolean {
        const errorDescripcion = document.getElementById('error-descripcion');
        const valor = input.value.trim();

        if (!errorDescripcion) return false;

        if (!valor) {
            errorDescripcion.textContent = 'La descripción es requerida';
            errorDescripcion.style.display = 'block';
            return false;
        }

        if (valor.length < 3) {
            errorDescripcion.textContent = 'La descripción debe tener al menos 3 letras';
            errorDescripcion.style.display = 'block';
            return false;
        }

        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(valor)) {
            errorDescripcion.textContent = 'Solo se permiten letras y espacios';
            errorDescripcion.style.display = 'block';
            return false;
        }

        errorDescripcion.style.display = 'none';
        return true;
    }

    private validarMonto(input: HTMLInputElement): boolean {
        const errorMonto = document.getElementById('error-monto');
        const valor = input.value.trim();
        const monto = parseFloat(valor);

        if (!errorMonto) return false;

        if (!valor || isNaN(monto) || monto <= 0) {
            errorMonto.textContent = 'Ingrese un monto válido mayor a 0';
            errorMonto.style.display = 'block';
            return false;
        }

        errorMonto.style.display = 'none';
        return true;
    }

    private validarEntrada(): boolean {
        const montoInput = document.getElementById('monto') as HTMLInputElement;
        const descripcionInput = document.getElementById('descripcion') as HTMLInputElement;

        const montoValido = this.validarMonto(montoInput);
        const descripcionValida = this.validarDescripcion(descripcionInput);

        return montoValido && descripcionValida;
    }

    private procesarTransaccion(tipo: "ingreso" | "gasto"): void {
        if (!this.validarEntrada()) return;

        const montoInput = document.getElementById('monto') as HTMLInputElement;
        const descripcionInput = document.getElementById('descripcion') as HTMLInputElement;
        const errorMonto = document.getElementById('error-monto');
        
        const monto = parseFloat(montoInput.value);

        // Validar saldo suficiente para gastos
        if (tipo === 'gasto' && monto > this.saldoActual) {
            if (errorMonto) {
                errorMonto.textContent = `Saldo insuficiente. Saldo actual: $${this.saldoActual.toFixed(2)}`;
                errorMonto.style.display = 'block';
            }
            return;
        }

        // Crear y guardar la transacción
        const transaccion: Transaccion = {
            descripcion: descripcionInput.value.trim(),
            monto: monto,
            tipo: tipo,
            fecha: new Date().toLocaleDateString()
        };

        this.transacciones.push(transaccion);
        this.saldoActual += tipo === 'ingreso' ? monto : -monto;
        
        localStorage.setItem('transacciones', JSON.stringify(this.transacciones));
        
        this.actualizarUI();
        this.limpiarFormulario();
    }

    private actualizarUI(): void {
        // Actualizar balance
        const balanceElement = document.getElementById('balance');
        if (balanceElement) {
            balanceElement.textContent = `Balance: $${this.saldoActual.toFixed(2)}`;
            balanceElement.style.color = this.saldoActual >= 0 ? '#4CAF50' : '#f44336';
        }

        // Actualizar historial
        const historialElement = document.getElementById('historial');
        if (historialElement) {
            historialElement.innerHTML = '';
            [...this.transacciones].reverse().forEach(t => {
                const div = document.createElement('div');
                div.className = `transaccion ${t.tipo}`;
                div.innerHTML = `
                    <div class="transaccion-info">
                        <strong>${t.descripcion}</strong>
                        <span class="monto">${t.tipo === 'ingreso' ? '+' : '-'}$${t.monto.toFixed(2)}</span>
                    </div>
                    <small>${t.fecha}</small>
                `;
                historialElement.appendChild(div);
            });
        }
    }

    private limpiarFormulario(): void {
        const montoInput = document.getElementById('monto') as HTMLInputElement;
        const descripcionInput = document.getElementById('descripcion') as HTMLInputElement;
        const errorMonto = document.getElementById('error-monto');
        const errorDescripcion = document.getElementById('error-descripcion');

        montoInput.value = '';
        descripcionInput.value = '';
        
        if (errorMonto) errorMonto.style.display = 'none';
        if (errorDescripcion) errorDescripcion.style.display = 'none';
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    new GestorTransacciones();
});