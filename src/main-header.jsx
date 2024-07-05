import { useContext } from "react";
import { AppSetting } from "./App-setting";
//eslint-disable-next-line
function MainHeader({user, ...rest}) {
  const { modelList, currentModel, changeModel } = useContext(AppSetting);
  return (
    <>
      <header className="bg-light py-3">
        <div className="row">
          <div className="col8">
            <h1>Hi {user ? user : ''}, Chat with me!</h1>
          </div>
          <div className="col-4">
            <p>model: {currentModel}</p>
            <select name="model" onChange={changeModel}>
              {modelList.map((val, i) => {
                let { name, value } = val;
                return <option value={value} key={i}>{name}</option>;
              })}
            </select>
          </div>
        </div>
      </header>
    </>
  );
} //end

export default MainHeader;
