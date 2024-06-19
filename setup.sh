#!/usr/bin/env bash

# Local vars
ASDF_VERSION=${ASDF_VERSION:-0.14.0}
ASDF_PLUGIN_MANAGER_VERSION=${ASDF_PLUGIN_MANAGER_VERSION:-1.3.1}
ASDF_HOME=$HOME/.asdf
ASDF_BIN=$ASDF_HOME/asdf.sh

set -e

colour() {
  local colour
  local message

  colour="$1"
  message="$2"

  case "$colour" in
  "red")
    printf "\033[0;31m %s \033[0m \n" "$message"
    ;;
  "green")
    printf "\033[0;32m %s \033[0m \n" "$message"
    ;;
  "yellow")
    printf "\033[0;33m %s \033[0m \n" "$message"
    ;;
  "cyan")
    printf "\033[0;36m %s \033[0m \n" "$message"
    ;;
  *)
    printf "%s" "$message"
    ;;
  esac
}

log() {
  local level
  local message

  level="$1"
  message="$2"

  case "$level" in
  "error")
    echo "🍙 🔥 $(colour red "${message}")"
    ;;
  "success")
    # print message in green text color
    echo "🍙 🟢 $(colour green "${message}")"
    ;;
  "warn")
    echo "🍙 ⛈️ $(colour yellow "${message}")"
    ;;
  *)
    echo "🍙 $(colour cyan "${message}")"
    ;;

  esac
}

info() {
  log info "$@"
}

warn() {
  echo ""
  log warn "$@"
  echo ""
}

success() {
  echo ""
  log success "$@"
  echo ""
}

error() {
  echo ""
  log error "$@"
  echo ""
}

group() {
  # if CI is detected, use the group command
  if [[ -n "${CI}" ]]; then
    echo "::group::$*"
  else
    log cyan "$*"
  fi
}

groupend() {
  # if CI is detected, use the groupend command
  if [[ -n "${CI}" ]]; then
    echo "::endgroup::"
  fi
}

does_command_exist() {
  command -v "$1" &>/dev/null
}

require_command() {
  if ! command -v "$1" &>/dev/null; then
    error "Missing $1"
  fi
}

append_uniquely() {
  if ! grep -q "$2" "$1"; then
    info "Writing \"$2\" into \"$1\" "
    echo "${2}" >>"$1"
  fi
}

get_shell_profile() {
  case "${SHELL}" in
  /bin/bash)
    echo ~/.bashrc
    return 0
    ;;
  /bin/zsh)
    echo ~/.zshrc
    return 0
    ;;
  esac
}

add_to_shell_profile() {
  local profile

  profile=$(get_shell_profile)
  group "Adding to shell profile"

  append_uniquely "$profile" ". $ASDF_HOME/asdf.sh"
  append_uniquely "$profile" ". $ASDF_HOME/completions/asdf.bash"

  groupend
}

install_asdf() {
  group "Installing/Updating ASDF"

  # does "$ASDF_BIN" exist? then run it
  # shellcheck disable=SC1090
  [[ -f "$ASDF_BIN" ]] && source "$ASDF_BIN"

  does_command_exist asdf || {
    warn "ASDF not detected ... installing"
    git clone https://github.com/asdf-vm/asdf.git "$ASDF_HOME" --branch "v$ASDF_VERSION"

    # if asdf is not on the path, add it and refresh the shell
    does_command_exist asdf || add_to_shell_profile
  }

  groupend

  group "Updating asdf..."
  # shellcheck disable=SC1090
  source "$ASDF_BIN"

  asdf update || true

  groupend
}

perform_patch() {
  local target
  local source

  target="$1"
  source="$2"

  info "Patching ${source} > ${target}"

  patch \
    --forward \
    --silent \
    --strip=1 \
    "$target" "$source"
}

install_asdf_plugin_manager() {
  group "Installing ASDF Plugin Manager ${ASDF_PLUGIN_MANAGER_VERSION}"
  asdf plugin add asdf-plugin-manager https://github.com/asdf-community/asdf-plugin-manager.git
  asdf plugin update asdf-plugin-manager "v${ASDF_PLUGIN_MANAGER_VERSION}"
  asdf uninstall asdf-plugin-manager
  asdf install asdf-plugin-manager "${ASDF_PLUGIN_MANAGER_VERSION}"
  asdf global asdf-plugin-manager "${ASDF_PLUGIN_MANAGER_VERSION}"
  perform_patch "$ASDF_HOME/plugins/asdf-plugin-manager/cli/asdf-plugin-manager.sh" "./asdf-plugin-manager.patch"
  perform_patch "$ASDF_HOME/installs/asdf-plugin-manager/${ASDF_PLUGIN_MANAGER_VERSION}/bin/asdf-plugin-manager" "./asdf-plugin-manager.patch"
  groupend

  group "Installing .plugin-versions"
  asdf-plugin-manager add-all
  groupend
}

install_asdf_tooling() {
  group "Installing .tool-versions"
  asdf install
  asdf reshim
  groupend
}

show_asdf_bom() {
  group "ASDF BOM"
  asdf current
  groupend
}

require_command git
require_command curl

install_asdf
install_asdf_plugin_manager
install_asdf_tooling
show_asdf_bom

info "Done"
