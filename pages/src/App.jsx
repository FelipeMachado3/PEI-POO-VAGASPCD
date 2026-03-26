import React from "react";

export default function App() {
  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container">
          <a className="navbar-brand fw-bold text-primary" href="#">
            Portal de Vagas PCD
          </a>

          <div className="ms-auto">
            <a href="/formulario" className="btn btn-outline-primary">
              Quero receber vagas
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="bg-primary text-white text-center py-5">
        <div className="container">
          <h1 className="fw-bold mb-3">
            Receba vagas PCD direto no seu WhatsApp 📲
          </h1>
          <p className="lead">
            Sem precisar procurar. Nós encontramos vagas ideais para você.
          </p>
          <a href="/formulario" className="btn btn-light mt-3">
            Quero me cadastrar
          </a>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="py-5 text-center">
        <div className="container">
          <h2 className="mb-4">Como funciona?</h2>

          <div className="row">
            <div className="col-md-4 mb-3">
              <h5>📝 Cadastro</h5>
              <p>Você preenche um formulário rápido</p>
            </div>

            <div className="col-md-4 mb-3">
              <h5>🔎 Seleção</h5>
              <p>Buscamos vagas compatíveis com você</p>
            </div>

            <div className="col-md-4 mb-3">
              <h5>📲 WhatsApp</h5>
              <p>Receba tudo direto no seu celular</p>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="bg-light py-5 text-center">
        <div className="container">
          <h2 className="mb-4">Por que usar?</h2>

          <div className="row">
            <div className="col-md-4 mb-3">
              <div className="card p-3 shadow-sm">
                <h5>🎯 Vagas filtradas</h5>
                <p>Só vagas que fazem sentido pra você</p>
              </div>
            </div>

            <div className="col-md-4 mb-3">
              <div className="card p-3 shadow-sm">
                <h5>⏱️ Economia de tempo</h5>
                <p>Sem precisar procurar manualmente</p>
              </div>
            </div>

            <div className="col-md-4 mb-3">
              <div className="card p-3 shadow-sm">
                <h5>💬 Direto no WhatsApp</h5>
                <p>Simples, rápido e prático</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-5 text-center">
        <div className="container">
          <h2 className="mb-3">Pronto para receber vagas?</h2>
          <a href="/formulario" className="btn btn-primary btn-lg">
            Começar agora
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-top text-center py-3">
        <p className="mb-0">© 2026 PCDJobs</p>
      </footer>
    </>
  );
}