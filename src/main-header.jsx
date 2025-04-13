import { useContext } from "react";
import { AppSetting } from "./App-setting";
//eslint-disable-next-line
function MainHeader({ user, ...rest }) {
  const {
    modelList,
    updateList,
    currentModel,
    changeModel,
    apiUrl,
    isStream,
    updateStream,
  } = useContext(AppSetting);
  const getListOfModels = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/tags`).then((response) =>
        response.json()
      );
      const models = response.models;
      updateList(models);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <>
      <header className="bg-light py-3">
        <div className="row">
          <div className="col">
            <h1>Hi {user ? user : ""}, Chat with me!</h1>
          </div>
          <div className="col-">
            <p>model: {currentModel}</p>
            <select name="model" onChange={changeModel}>
              {modelList.map((val, i) => {
                let { name, model } = val;
                return (
                  <option value={model} key={i}>
                    {name.split(":")[0]}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="col">
            <button onClick={getListOfModels}>Refresh</button>
            <button type="button" onClick={()=>updateStream(stream => !isStream)}>
              Stream {isStream ? "On" : "Off"}
            </button>
          </div>
        </div>
      </header>
    </>
  );
} //end

export default MainHeader;
