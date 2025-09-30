let title = document.getElementById("title");
let text_div = document.getElementById("text");
let story_div = document.getElementById("selector")
let content_div = document.getElementById("content");
let restart_a_tag = document.getElementById("restart-tag");

restart_a_tag.style.display = "none";

let data;
let stories = [];

let a_tag_template = "<a name='{0}' href=''>{1}</a>";

let last_file_name;

async function loadPage(page_id, file_name=last_file_name) {
  const resp = await fetch("../static/stories/" + file_name);
  data = await resp.json();

  refreshContent(page_id);
}

function refreshContent(page_id) {
  let page = data["pages"][page_id];

  let bg_url = data["bg"];
  let textbox_bg_url = data["textbox_bg"];

  if ("bg" in page) {
    bg_url = page["bg"];
  }

  if ("textbox_bg" in page) {
    textbox_bg_url = page["textbox_bg"];
  }

  document.body.style.backgroundImage = "url(" + bg_url + ")";
  document.getElementById("content").style.backgroundImage =
    "url(" + textbox_bg_url + ")";

  title.innerText = page["title"];

  let text = page["text"];

  let links = findAllLinks(text);
  let new_text = replaceLinksWithATags(text, links, page["links"]);

  if (links.length == 0) {
    restart_a_tag.style.display = "inline-block";
  }

  text_div.innerHTML = new_text;

  setupEventListeners();
}

function setupEventListeners() {
  let childs = text_div.children;
  let a_tags = [];

  for (let index = 0; index < childs.length; index++) {
    if (childs.item(index).tagName == "A") {
      a_tags.push(index);
    }
  }

  a_tags.forEach((index) => {
    childs.item(index).addEventListener("click", (e) => {
      e.preventDefault();

      loadPage(childs.item(index).name);
    });
  });
}

function replaceLinksWithATags(string, text_links, links) {
  let links_without_brackets = [];
  text_links.forEach((link) => {
    let new_link = link.slice(1, -1);
    links_without_brackets.push(new_link);
  });

  let new_string = "<p>" + string + "</p>";
  for (let index = 0; index < text_links.length; index++) {
    let a_tag = a_tag_template;
    a_tag = a_tag.replace("{0}", links[index]);
    a_tag = a_tag.replace("{1}", links_without_brackets[index]);

    new_string = new_string.replace(text_links[index], "</p>" + a_tag + "<p>");
  }

  return new_string;
}

function findAllLinks(string) {
  let indicies = [];
  for (let index = 0; index < string.length; index++) {
    if (string.at(index) == "{" || string.at(index) == "}") {
      indicies.push(index);
    }
  }

  let links = [];
  for (let index = 0; index < indicies.length; index += 2) {
    let link_text = string.slice(indicies[index], indicies[index + 1] + 1);

    links.push(link_text);
  }

  return links;
}

function loadStory(filename) {
  loadPage("start", filename);
  story_div.style.display = "none";
  content_div.style.display = "block";

  last_file_name = filename;
}

let story_template = "<div class='story-div-display'><h2>{0}</h2> <button onclick='loadStory({1})'>Start</button></div>\n";
async function displayAllStories() {
  let count = 0;

  for (let index = 0; index < stories.length; index++) {
    let story = stories[index];

    let code = story_template;
    code = code.replace("{0}", story["title"]);
    code = code.replace("{1}", '"' + story["file"] + '"');
    
    story_div.innerHTML += code;
    let div = story_div.getElementsByClassName("story-div-display")[index];

    f = story["file"];

    const resp = await fetch("../static/stories/" + f);
    data = await resp.json();

    bg_url = data["textbox_bg"];

    div.style.setProperty("--image_url", "url('{0}')".replace("{0}", bg_url));
  }
}

async function loadAllStories() {
  const resp = await fetch("../static/stories/index.json");
  stories = await resp.json();
  stories = stories["stories"];

  displayAllStories();
}

loadAllStories();
