export default function Home() {
  return (
    <main style={{background:"#0b1220", color:"white", minHeight:"100vh", padding:"20px"}}>
      <h1 style={{fontSize:"28px", fontWeight:"bold"}}>
        FIFA World Cup 2026™
      </h1>
      <p>ABD · Kanada · Meksika</p>

      <div style={{marginTop:"40px"}}>
        <h2>LİG TABLOSU</h2>
        <table style={{width:"100%", marginTop:"20px", borderCollapse:"collapse"}}>
          <thead>
            <tr style={{borderBottom:"1px solid gray"}}>
              <th>#</th>
              <th>Ad Soyad</th>
              <th>Puan</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Mert Alperten</td>
              <td>0</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Şamil Yaşar</td>
              <td>0</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}
