# Sistema de Alarmas - TickGuard

Este documento describe el sistema de alarmas implementado para notificar a los usuarios sobre tareas próximas.

## Funcionalidades

### 🔔 Tipos de Alarmas

1. **Alarma de 5 minutos**: Se dispara 5 minutos antes de que comience una tarea
2. **Alarma de 1 minuto**: Se dispara 1 minuto antes de que comience una tarea

### 🎵 Tipos de Notificación

1. **Notificaciones Sonoras**:
   - Tonos generados usando Web Audio API
   - Frecuencia diferente para cada tipo de alarma
   - Las alarmas urgentes (1 minuto) reproducen múltiples tonos

2. **Notificaciones Visuales**:
   - Notificaciones del navegador (requiere permisos)
   - Notificaciones en pantalla con animaciones
   - Diferentes estilos para advertencias y urgencias

## Componentes

### AlarmService (`core/services/alarm.service.ts`)

Servicio principal que maneja toda la lógica de alarmas:

- **Configuración**: Permite habilitar/deshabilitar tipos de alarma
- **Monitoreo**: Verifica cada 30 segundos si hay tareas próximas
- **Audio**: Genera tonos usando Web Audio API
- **Persistencia**: Evita duplicados usando localStorage

### AlarmNotificationsComponent (`core/components/alarm-notifications/`)

Componente que muestra las notificaciones visuales:

- **Posicionamiento fijo**: Top-right de la pantalla
- **Animaciones**: Slide-in y pulse para urgencias
- **Interactivo**: Permite cerrar notificaciones manualmente
- **Responsive**: Adapta a tema claro/oscuro

### AlarmSettingsComponent (`core/components/alarm-settings/`)

Panel de configuración de alarmas:

- **Toggle principal**: Habilita/deshabilita todo el sistema
- **Configuraciones granulares**: Control independiente de sonido, visual, 5min, 1min
- **Prueba de alarma**: Botón para probar configuración actual
- **Permisos**: Solicita automáticamente permisos de notificación

## Configuración

### Configuración por Defecto

```typescript
{
  enabled: true,           // Sistema habilitado
  sound: true,            // Alarmas sonoras activas
  visual: true,           // Notificaciones visuales activas
  minutes5Before: true,   // Alarma 5 minutos antes
  minutes1Before: true,   // Alarma 1 minuto antes
}
```

### Permisos del Navegador

El sistema solicita automáticamente permisos para:

- **Notificaciones**: Para mostrar notificaciones del navegador
- **Audio**: Para reproducir tonos de alarma

## Integración

### En la Página Home

```typescript
// Cargar tareas del día y configurar alarmas
this.routinesService.getTaskForToday().subscribe((dailyTasks) => {
  this.alarmService.setTasks(dailyTasks.tasks);
});
```

### En el Template

```html
<!-- Panel de configuración (posición fija bottom-right) -->
<app-alarm-settings></app-alarm-settings>

<!-- Notificaciones (posición fija top-right) -->
<app-alarm-notifications></app-alarm-notifications>
```

## Comportamiento

### Lógica de Disparado

1. **Verificación cada 30 segundos** de tareas pendientes
2. **Cálculo de tiempo restante** hasta la hora programada de cada tarea
3. **Disparo de alarma** cuando:
   - Faltan 5 minutos (tipo: 'warning')
   - Falta 1 minuto (tipo: 'urgent')

### Prevención de Duplicados

- Las alarmas se marcan como disparadas en localStorage
- No se vuelven a disparar durante 2 minutos
- Identificación única por tarea y tipo de alarma

### Estados de Tarea

Solo se consideran tareas con estado `'pending'` que tengan `timeLocal` definido.

## Estilos y UX

### Notificaciones Visuales

- **Warning (5 min)**: Fondo amarillo, ícono 🔔
- **Urgent (1 min)**: Fondo rojo, ícono ⚠️, animación de pulso
- **Auto-dismiss**: No se cierran automáticamente
- **Manual dismiss**: Botón X para cerrar individualmente

### Panel de Configuración

- **Slide panel**: Se desliza desde la derecha
- **Overlay**: Fondo semitransparente cuando está abierto
- **Controles deshabilitados**: Cuando el sistema está apagado
- **Botón de prueba**: Para verificar configuración

## Compatibilidad

### Navegadores Soportados

- **Chrome/Edge**: Soporte completo
- **Firefox**: Soporte completo
- **Safari**: Soporte básico (sin webkitAudioContext)

### Fallbacks

- Si no hay soporte para Web Audio API, solo se muestran notificaciones visuales
- Si no hay permisos de notificación, solo se muestran notificaciones en pantalla

## Desarrollo

### Agregar Nuevo Tipo de Alarma

1. Actualizar interface `AlarmConfig`
2. Agregar lógica en `checkForAlarms()`
3. Actualizar componente de configuración
4. Agregar estilos correspondientes

### Personalizar Sonidos

Modificar `playAlarmSound()` en `AlarmService`:

```typescript
const frequency = type === 'urgent' ? 880 : 440;
const duration = type === 'urgent' ? 1.5 : 1.0;
```

### Personalizar Visuales

Modificar estilos CSS en `alarm-notifications.component.css`:

```css
.notification.urgent {
  border-left-color: #ef4444;
  animation:
    slideIn 0.3s ease-out,
    pulse 2s infinite;
}
```
