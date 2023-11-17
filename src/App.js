import "./styles.css";

export default function App() {
  const [data, setData] = useState([]);
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
    </div>
    <Co2SavedComponent APIData={data} />
  );
  function Co2SavedComponent(props) {
    return (
      <>
        <h1>Co2 Saved:</h1>
        <table border="1">
          <thead>
            <tr>
              <th>Type</th>
              <th>Co2Produced</th>
            </tr>
          </thead>
          <tbody>
            {props.APIData.map((t, index) => (
              <tr key={index}>
                <td>
                  <b>{t.type}</b>
                </td>
                <td>
                  <b>{t.co2Produced}</b>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  }
}
