import { Link } from "@remix-run/react"

export default function HomePage() {
  return (
    <>
      <section id="introduction">
        <h2>
          Welcome, dear traveller!
        </h2>
        <aside>
          These pages are an effort to create an easy-to-use, easy-to-read, free (free as in <em>freedom</em>)
          online version of Benedictus de Spinoza's book of philosophy, the <i>Ethics</i>.
        </aside>
      </section>
      <section id="sitemap">
        <h2>Sitemap</h2>
        <nav>
          <h3>English Translation (R. Elwes, 1883)</h3>
          <ol>
            <li>
              <Link to="/en/1">Part 1</Link>
            </li>
            <li>
              <Link to="/en/2">Part 2 </Link>
            </li>
            <li>
              <Link to="/en/3">Part 3 </Link>
            </li>
            <li>
              <Link to="/en/4">Part 4 </Link>
            </li>
            <li>
              <Link to="/en/5">Part 5 </Link>
            </li>
          </ol>
          <h3>Latin Edition (C. Gebhardt)</h3>
          <ol>
            <li>
              <Link to="/la/1">Part 1</Link>
            </li>
            <li>
              <Link to="/la/2">Part 2 </Link>
            </li>
            <li>
              <Link to="/la/3">Part 3 </Link>
            </li>
            <li>
              <Link to="/la/4">Part 4 </Link>
            </li>
            <li>
              <Link to="/la/5">Part 5 </Link>
            </li>
          </ol>
          <h3>Latin/English split screen reader</h3>
          <ol>
            <li>
              <Link to="/view/?view1=la&view2=en&part1=1&part2=1">Part 1 </Link>
            </li>
            <li>
              <Link to="/view/?view1=la&view2=en&part1=2&part2=2">Part 2 </Link>
            </li>
            <li>
              <Link to="/view/?view1=la&view2=en&part1=3&part2=3">Part 3 </Link>
            </li>
            <li>
              <Link to="/view/?view1=la&view2=en&part1=4&part2=4">Part 4 </Link>
            </li>
            <li>
              <Link to="/view/?view1=la&view2=en&part1=5&part2=5">Part 5 </Link>
            </li>
          </ol>
        </nav>
      </section>
      <section id="references">
        <h2>References</h2>
        <ol>
          <li>
            <Link to="http://app.ethica-spinoza.net"> Ethica, du travail sans obstacle/ Ethica, work without obstacle</Link>
            <label>
              {"  "}An open source project with similar goals. Special thanks to the team for providing the editions used in the present software in an easily parsable format.
            </label>
          </li>
          <li>
            <Link to="https://en.wikisource.org/wiki/Ethics_(Spinoza)"> Wikisource: R. H. M. Elwes (1883), Ethics, English Translation</Link>
          </li>
          <li>
            <Link to="https://la.wikisource.org/wiki/Ethica"> Vicifons: Benedictus de Spinoza (1677), Ethica, Editio Incognita</Link>
          </li>
          <li>
            <Link to="https://www.gutenberg.org/ebooks/author/473">Project Gutenberg: Books by Spinoza</Link>
          </li>
        </ol>
        <h3>Source code</h3>
        <Link to="https://github.com/anselmjiayu/ethica-toolkit">Github</Link>
        <p>This website is written with modularity and ease of customization in mind. You are invited to change and adapt the code: see <Link to="https://github.com/anselmjiayu/ethica-toolkit/blob/master/LICENSE">LICENSE</Link>.</p>
      </section>
    </>
  )
}
