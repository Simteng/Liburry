import React, {Component} from "react";
import ReactDOM from "react-dom";
import fuzzysort from "fuzzysort";

import {Taigi, SearchBar, PlaceholderArea, ResultsArea} from "./components.js";

import "./cha_taigi.css";

// TODO(urgent): use delimiters instead of dangerouslySetInnerHTML
// TODO(high): Copy to clipboard on click or tab-enter
// TODO(high): have search updates appear asynchronously from typing
// TODO(high): use react-window or react-virtualized to only need to render X results at a time
// TODO(high): figure out why first search is slow, and if it can be sped up
// TODO(high): use <mark></mark> instead of individual spans
// TODO(mid): keybinding for search (/)
// TODO(mid): button for "get all results", default to 10-20
// TODO(mid): visual indication that there were more results
// TODO(low): have GET param for search (and options?)
// TODO(low): store options between sessions
// TODO(low): radio buttons of which text to search
// TODO(wishlist): dark mode support
// TODO(wishlist): non-javascript support?

const SEARCH_RESULTS_LIMIT = 20;
const DISPLAY_RESULTS_LIMIT = 20;
const poj = [];

//const rem_url = "maryknoll_smaller.json";
const rem_url = "maryknoll_normalized_minified.json"

const fuzzyopts = {
  keys: ["poj_norm_prepped", "eng_prepped", "poj_unicode"],
  allowTypo: false,
  limit: SEARCH_RESULTS_LIMIT,
  threshold: -10000,
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      raw_results: [],
      results: [],
      loaded: false,
    };
    this.current_search = {query: "", promise: null};
    this.query = "";
    this.local_poj = poj;
    this.timeout = 0;
    this.output = null;
    this.onChange = this.onChange.bind(this);
    this.createResultsForRender = this.createResultsForRender.bind(this);
  }

  componentDidMount() {
    fetch(rem_url)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        data.forEach(
          t => {
            t.poj_prepped = fuzzysort.prepareSlow(t.poj_unicode);
            t.poj_norm_prepped = fuzzysort.prepareSlow(t.poj_normalized);
            t.eng_prepped = fuzzysort.prepareSlow(t.english);
          }
        )
        this.local_poj = data;
        this.setState({loaded: true});
      });

  }

  onChange(e) {
    const {target = {}} = e;
    const {value = ""} = target;
    const query = value;

    const current_search = this.current_search;

    if (query === "") {
      if (current_search.promise != null) {current_search.promise.cancel();}
      this.setState({query, searching: false});
      return;
    }

    const new_search_promise = fuzzysort.goAsync(
      query,
      this.local_poj,
      fuzzyopts,
    );
    const new_search = {query, promise: new_search_promise};

    if (current_search.promise != null) {current_search.promise.cancel();}
    new_search.promise.cancel = new_search.promise.cancel.bind(new_search);

    new_search.promise.then(raw_results => this.createResultsForRender(raw_results, query)).catch(console.log);

    this.current_search = new_search;
    this.setState({query, searching: true});
  }

  createResultsForRender(raw_results, query) {
    const results = raw_results
      .slice(0, DISPLAY_RESULTS_LIMIT)
      .map((x, i) => {
        const poj_norm_pre_paren = fuzzysort.highlight(x[0],
          "<span class=\"poj-normalized-matched-text\" class=hlsearch>", "</span>")
          || x.obj.poj_normalized;
        const poj_norm_high = "(" + poj_norm_pre_paren + ")";
        const eng_high = fuzzysort.highlight(x[1],
          "<span class=\"english-definition-matched-text\" class=hlsearch>", "</span>")
          || x.obj.english;
        const poj_unicode = fuzzysort.highlight(x[2],
          "<span class=\"poj-unicode-matched-text\" class=hlsearch>", "</span>")
          || x.obj.poj_unicode;
        return <Taigi key={i} poj_unicode={poj_unicode} english={eng_high} poj_normalized={poj_norm_high} />;
      })

    this.setState({results, query, searching: false});
  }

  render() {
    const {onChange} = this;
    const {results, query, loaded, searching} = this.state;

    // TODO: store boolean state of loading placeholder
    return (
      <div className="App">
        <SearchBar onChange={onChange} />
        <PlaceholderArea query={query} num_results={results.length} loaded={loaded} searching={searching} />
        <ResultsArea results={results} query={query} searching={searching} />
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
