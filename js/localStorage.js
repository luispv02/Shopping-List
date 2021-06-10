const formulario = document.querySelector('#formulario');
const listaCompras = document.querySelector('#lista-compras')

eventListeners();
function eventListeners(){
    document.addEventListener('DOMContentLoaded', () => {
        pedirPresupuesto();
        mostrarLocalStorage();
        cambiarRestanteHTML();
    })

    formulario.addEventListener('submit', agregarCompra)
}

class Presupuesto{
    constructor(presupuesto){
        this.presupuesto = Number(presupuesto);
        this.restante = Number(presupuesto);
        this.arregloCompras = [];
    }

    //Agregar objCompra al carrito arregloCompras
    agregarCompraArreglo(objCompra){
        this.arregloCompras = [...this.arregloCompras, objCompra]
        console.log(this.arregloCompras)

        //Guardar el arregloCompras en localStorage
        localStorage.setItem('compras', JSON.stringify(this.arregloCompras))
        
        this.actualizarRestante()
    }

    actualizarRestante(arregloCompras){
        const gastado = this.arregloCompras.reduce((total,compra) => total + compra.costo,0);

        this.restante = this.presupuesto - gastado;
        
        localStorage.setItem('restante', this.restante)
        
        cambiarRestanteHTML();
    }

    quitarCompra(id){
    
        let comprasLocal = JSON.parse(localStorage.getItem('compras'))
        let arregloCompras = comprasLocal.filter(compra => compra.id !== id);

        this.arregloCompras = arregloCompras; // Se asignan nuevos valores

        localStorage.setItem('compras', JSON.stringify(arregloCompras));

        mostrarLocalStorage();
        this.actualizarRestante(); 
        ui.cambiarColorRestante(presupuesto)
    }
}

class UI{
    //Mostrar presupueto y restante en el HTML
    mostrarPresupuestoRestante(presupuestoTotal){

        const {presupuesto} = presupuestoTotal;

        document.querySelector('#presupuesto').textContent = presupuesto
        document.querySelector('#restante').textContent = presupuesto
    }

    mostrarAlertas(mensaje, tipo){
        const mensajeAlerta = document.createElement('div');
        mensajeAlerta.classList.add('alert', 'text-center','alert-success')
        mensajeAlerta.textContent = mensaje

        if(tipo === 'error'){
            mensajeAlerta.classList.add('alert-danger')
        }
        document.querySelector('.col-primario').insertBefore(mensajeAlerta,formulario)

        setTimeout(() => {
            mensajeAlerta.remove()
        },3000)
    }

    cambiarColorRestante(presupuestoTotal){
        const {presupuesto,restante} = presupuestoTotal;
        const divRestante = document.querySelector('.restante');

        if((presupuesto / 4) > restante){
            divRestante.classList.remove('alert-success', 'alert-warning')
            divRestante.classList.add('alert-danger')
     
        }else if((presupuesto / 2) > restante){
            divRestante.classList.remove('alert-success','alert-danger')
            divRestante.classList.add('alert-warning')
        }else{
            divRestante.classList.remove('alert-danger', 'alert-warning')
            divRestante.classList.add('alert-success')
        }

        if(restante <= 0){
            ui.mostrarAlertas('Se ha agotado el presupuesto', 'error')
            document.querySelector('#agregar-compra').disabled = true;
        }else{
            document.querySelector('#agregar-compra').disabled = false;
        }
    }

}

//Instanciamos las clases
const ui = new UI;
let presupuesto;

//Pedir presupuesto al usuario
function pedirPresupuesto(){

    let presupuestoTotal = 0

    do{
        let presupuestoUsuario =  localStorage.getItem('presupuesto');

        if(!presupuestoUsuario){
            presupuestoUsuario = prompt('Ingresa tu presupuesto')
        }
        

        if(presupuestoUsuario <= 0 || isNaN(presupuestoUsuario)){
        }else{
            localStorage.setItem('presupuesto', presupuestoUsuario)
            presupuestoTotal = presupuestoUsuario
        }
    }while(presupuestoTotal <= 0) 

    
    if(localStorage.getItem('restante')){

    }else{
        localStorage.setItem('restante', presupuestoTotal)
    }

    //Agregar presupuesto y restante
    presupuesto = new Presupuesto(presupuestoTotal);
    


    //Mostrar el presupuesto y restante del HTML
    ui.mostrarPresupuestoRestante(presupuesto)
}

//Agregar compra al dar click en comprar compra
function agregarCompra(e){
    e.preventDefault();

    const compra = document.querySelector('#compra').value;
    const costo = Number(document.querySelector('#costo').value);

    if(compra === '' || costo === ''){
        ui.mostrarAlertas('Debe agregar una compra y su costo', 'error')
        return;
    }else if(costo <= 0 || isNaN(costo)){
        ui.mostrarAlertas('El costo no es valido', 'error')
        return;
    }

    //Objeto con la compra y el costo y un id
    const objCompra = {
        compra,
        costo,
        id:Date.now(),
    }

    ui.mostrarAlertas('Se ha agregado la compra')

    //Agregar el objeto con las compras al arregloCompras
    presupuesto.agregarCompraArreglo(objCompra)

    //MOSTRAR COMPRA EN EL HTML DESDE LOCALSTORAGE
    mostrarLocalStorage();

    //Cambiar cantidad restante al agregarCompra HTML
    ui.cambiarColorRestante(presupuesto);


    formulario.reset();

}


// MOSTRAR LOS ELEMENTOS AGREGADOS AL LOCAL STORAGE, SE REINCIIAN AL SALIR Y ENTRAR Y GREGAR UNA NUEVA COMPRA
function mostrarLocalStorage(arregloCompras){

    limpiarHTML();
    let comprasLocalStorage = JSON.parse(localStorage.getItem('compras')) || [];
    
    comprasLocalStorage.forEach(compraLocal => {

        const {compra,costo,id} = compraLocal;

        const compraItem = document.createElement('li');
        compraItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center')

        compraItem.innerHTML = `${compra}<span class="badge bg-primary rounded-pill">${costo}</span>`

        //Crear boton de eliminar compra
        const btnEliminar = document.createElement('button');
        btnEliminar.classList.add('btn', 'btn-danger')
        btnEliminar.textContent = 'Eliminar'
        btnEliminar.dataset.id = id
        btnEliminar.onclick = () => {
            eliminarCompra(id)
        }

        listaCompras.appendChild(compraItem)
        compraItem.appendChild(btnEliminar)
    })
}

function limpiarHTML(){
    while(listaCompras.firstChild){
        listaCompras.removeChild(listaCompras.firstChild)
    }
}

function cambiarRestanteHTML(RestanteoLocal){
    document.querySelector('#restante').textContent = localStorage.getItem('restante')
}

function eliminarCompra(id){
    presupuesto.quitarCompra(id)
}

/* const gastado = this.arregloCompras.reduce((total,compra) => total + compra.costo,0);
this.restante = this.presupuesto - gastado;
localStorage.setItem('restante', this.restante)
cambiarRestanteHTML(); */