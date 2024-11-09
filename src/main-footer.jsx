import dayjs from "dayjs";

function MainFooter() {
  return (
    <footer className="bg-dark py-3 mt-auto">
      <div className="container">
        {/* <div className="col">&copy; {dayjs().format("YYYY")}</div> */}
        <div className="col">Develop by bpsingh</div>
      </div>
    </footer>
  );
} //end

export default MainFooter;
