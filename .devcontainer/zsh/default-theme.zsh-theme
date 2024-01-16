USER_COLOR="%{$fg_no_bold[cyan]%}"
PATH_COLOR="%{$fg_no_bold[green]%}"
GIT_COLOR="%{$fg_no_bold[red]%}"
HIGHLIGHT_COLOR="%{$fg_bold[blue]%}"
RESET_COLOR="%{$reset_color%}"

ZSH_THEME_GIT_PROMPT_PREFIX="$HIGHLIGHT_COLOR($GIT_COLOR"
ZSH_THEME_GIT_PROMPT_SUFFIX="$HIGHLIGHT_COLOR)$RESET_COLOR"
ZSH_THEME_GIT_PROMPT_CLEAN="😊"
ZSH_THEME_GIT_PROMPT_DIRTY="😓"

# Copied from old version of tonotdo's theme. LSCOLORS modified.
PROMPT='$USER_COLOR%n$HIGHLIGHT_COLOR:$PATH_COLOR%3~$(git_prompt_info)»$RESET_COLOR '
