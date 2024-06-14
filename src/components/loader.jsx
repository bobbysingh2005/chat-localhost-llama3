import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const LoaderSpinner = () => {
  return (<span aria-live='polite'>loading...
  <FontAwesomeIcon icon={faSpinner} pulse spin />
  </span>);
};

export default LoaderSpinner;
