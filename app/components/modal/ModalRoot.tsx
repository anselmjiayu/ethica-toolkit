export default function ModalRoot({children, show, handleClose}
  : {children: React.ReactNode, show: boolean, handleClose: ()=>void}) {
  return (<div className={"modal-root" + (show ? "display-block" : "display-none")}>
    {children}
    <button type="button" onClick={handleClose}>
      Close
    </button>
  </div>)
}
