export default function ShowHints() {
  return (
    <section>
      <div>
        <p>General</p>
        <dl>
          <div className="kbd-desc">
            <dt>
              <kbd>?</kbd> / <kbd>H</kbd>
            </dt>
            <dd>
              Show this menu
            </dd>
          </div>

          <div className="kbd-desc">
            <dt>
              <kbd>Esc</kbd>
            </dt>
            <dd>
              Exit menu
            </dd>
          </div>

        </dl>
      </div>
      <div>
        <p>Text</p>
        <dl>
          <div className="kbd-desc">
            <dt>
              <kbd>\</kbd>
            </dt>
            <dd>
              Toggle Header
            </dd>
          </div>
        </dl>
      </div>
      <div>
        <p>Theme</p>
        <dl>
          <div className="kbd-desc">
            <dt>
              <kbd>Shift</kbd>+<kbd>R</kbd>
            </dt>
            <dd>
              Invert Theme Color
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
