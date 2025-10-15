# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - img [ref=e7]
        - text: FocusFlow
      - generic [ref=e10]: Inicia sesión para ordenar tu mente.
    - generic [ref=e12]:
      - generic [ref=e13]:
        - generic [ref=e14]: Correo
        - textbox "Correo" [ref=e15]
      - generic [ref=e16]:
        - generic [ref=e17]: Contraseña
        - textbox "Contraseña" [ref=e18]
        - button "¿Olvidé mi contraseña?" [ref=e20] [cursor=pointer]
      - button "Iniciar Sesión" [ref=e21] [cursor=pointer]
    - paragraph [ref=e23]:
      - text: ¿No tienes una cuenta?
      - link "Regístrate" [ref=e24] [cursor=pointer]:
        - /url: /signup
  - region "Notifications (F8)":
    - list
  - alert [ref=e25]
  - button "Open Next.js Dev Tools" [ref=e31] [cursor=pointer]:
    - img [ref=e32] [cursor=pointer]
```