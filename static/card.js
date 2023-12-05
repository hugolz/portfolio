function elementFromHtml(html) {
    const template = document.createElement("template");

    template.innerHTML = html.trim();

    return template.content.firstElementChild;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


function create_card(repo) {
    const card = elementFromHtml(`
        <div class="project card">
            <a href="https://github.com/${repo.owner_name}/${repo.name}" class="card-link"><div class="card-bg"></div>
                <div class="card-title">
                    <img src="../resources/${repo.language.toLowerCase()}.png" class="icon">
                    ${capitalizeFirstLetter(repo.name.replace("_", " "))}
                </div>
                <div class="card-description">${repo.description}</div>
                <div class="card-date-box">
                Last update:
                <span class="card-date">
                ${repo.last_push_date.toLocaleDateString()} ${repo.last_push_date.getHours()}h${repo.last_push_date.getMinutes()}
                </span>
                </div>
            </a>
        </div> 
    `);
    return card;
}


async function generate_cards(nbr_of_cards, required_repos) {

    const hugolz_repo_list = await list_user_repo("hugolz");
    const bowarc_repo_list = await list_user_repo("Bowarc");

    if (hugolz_repo_list == -1 || bowarc_repo_list == -1) {
        return;
    }

    let repo_list = bowarc_repo_list.concat(hugolz_repo_list);

    repo_list = repo_list.filter((repo, index) => {
        // False to remove the element
        console.log(`${repo.owner_name} | ${repo.name}`);
        if (repo.fork) {
            console.log("Skipped, fork");
            return false;
        }
        if (repo.description == null) {
            console.log("Skipped, null")
            return false;
        }
        if (repo.name.toLowerCase() == repo.owner_name.toLowerCase()) {
            console.log("Skipped, profile repo");
            return false;
        }
        if (repo.name.includes(".nvim")) {
            console.log("Skipped, config files");
            return false;
        }

        return true;
    });

    repo_list = repo_list.sort((a, b) => {
        return new Date(b.last_push_date) - new Date(a.last_push_date);
        // return b.size - a.size;
    });


    for (repo of repo_list) {
        let contains = false;
        for (name of required_repos) {
            if (name.toLowerCase() == repo.name.toLowerCase()) {
                contains = true;
                break
            }
        }

        if (contains) {
            let card = create_card(repo);
            let project_list = document.getElementById("project_list");
            project_list.appendChild(card);

            repo_list.splice(repo_list.findIndex((repo2, index) => {
                return repo.name == repo2.name
            }), 1);

            nbr_of_cards--;

        }
    }


    console.log(repo_list);


    for (let i = 0; i < nbr_of_cards; i++) {
        let repo = repo_list[i];
        if (repo == null) {
            break
        }
        let card = create_card(repo);

        let project_list = document.getElementById("project_list");
        project_list.appendChild(card);
    }
}

generate_cards(5, ["chess_game", "lumin", "cdn", "crates", "binput_sim"]);