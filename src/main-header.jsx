
const mainHeader = () => {
    return (
        <>
        <!-- Header -->
    <header class="bg-light py-3">
      <nav class="container">
        <ul class="nav justify-content-center">
          <li class="nav-item"><a class="nav-link active" href="#">Home</a></li>
          <li class="nav-item"><a class="nav-link" href="#">About</a></li>
          <li class="nav-item"><a class="nav-link" href="#">Contact</a></li>
        </ul>
      </nav>
    </header>
        <header>
                <h1>Hi {user}, Chat with me!</h1>
            </header>
        </>
    )
};//end

export default mainHeader;