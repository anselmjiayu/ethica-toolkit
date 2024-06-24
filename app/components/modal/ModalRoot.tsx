import CrossIcon from "~/svg/cross";

export default function ModalRoot({ children, show, handleClose }
  : { children: React.ReactNode, show: boolean, handleClose: () => void }) {
  return (<div className={"modal-root" + (show ? " show-modal" : "")}>
    <div className="modal-window">
      <div className="modal-text">
        {children}
      </div>

      {/* Provide a button to exit modal dialog */}
      <button className="modal-close" type="button" onClick={handleClose}>
        <CrossIcon />
      </button>
    </div>
  </div>)
}
