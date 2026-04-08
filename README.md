# Micro-Commerce-MS (NexaCommerce)

Micro-Commerce-MS (NexaCommerce) es una plataforma de comercio electrónico construida bajo una arquitectura de microservicios orientada a la escalabilidad y al despliegue contenedorizado. El diseño separa los principales dominios de negocio en servicios independientes para facilitar su mantenimiento y evolución.

## Arquitectura del Proyecto

El sistema está compuesto por los siguientes módulos integrados:

- **Frontend**: Aplicación interactiva desarrollada en Vue.js 3, encargada de presentar la interfaz gráfica a los clientes finales y administradores de la plataforma.
- **API Gateway**: Punto de entrada centralizado configurado para enrutar de forma segura todas las peticiones del frontend a los diferentes microservicios del negocio.

### Microservicios Backend

Los servicios backend están diseñados para operar de forma autónoma:

- **Users Service**: Encargado del registro, autenticación y administración de perfiles de usuario.
- **Products Service**: Administra el catálogo completo de productos, categorías y disponibilidad en inventario.
- **Cart Service**: Mantiene el estado en tiempo real del carrito de compras de cada usuario previo a la finalización del pedido.
- **Orders Service**: Responsable del flujo de checkout, consolidación del carrito e historización de órdenes.
- **Reports Service**: Sistema de extracción y consolidación de datos para la posterior visualización de reportes analíticos de negocio.

## Stack Tecnológico

- **Frontend**: Vue.js 3
- **Backend**: Node.js (con Express para la capa de servicios)
- **Bases de Datos**: MongoDB (modelo documental para usuarios, productos, carrito y órdenes) y MySQL (modelo relacional estructurado para analítica en el servicio de reportes).
- **Despliegue y Orquestación**: Entorno completamente dockerizado utilizando Docker y Docker Compose.

## Guía de Despliegue Local

Para levantar el entorno local, se requiere únicamente tener instalados Docker y Docker Compose en la estación de trabajo.

1. Clonar este repositorio en la máquina local.
2. Validar que los puertos requeridos (80, 3000 a 3005, 27017 y 3306) se encuentren libres y no asignados a otros procesos.
3. Ejecutar el comando para construir las imágenes y levantar la red de contenedores:

```bash
docker-compose up --build
```

Una vez finalizado el proceso de inicialización:

- El portal web **Frontend** se expondrá en el puerto 80 (accesible vía <http://localhost>).
- El **API Gateway** gestionará las solicitudes desde el puerto 3000.
- Cada microservicio posee su propio entorno aislado y bases de datos inicializadas automáticamente.