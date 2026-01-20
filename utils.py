import time
import os
from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich.progress import Progress, SpinnerColumn, TextColumn

# Initialize the rich console for colorful output
console = Console()

def clear_screen():
    """Clears the terminal screen for a clean look."""
    os.system('cls' if os.name == 'nt' else 'clear')

def print_banner():
    """Prints the main logo/banner of the tool."""
    clear_screen()
    title = Text("SENTINEL AUDIT", justify="center", style="bold cyan")
    subtitle = "[bold white]Automated Vulnerability Scanner & Reporting Tool[/bold white]"
    version = "[dim]v1.0.0 - Internship Build[/dim]"
    
    # Create the panel content
    content = Text.assemble(title, "\n", subtitle, "\n", version, justify="center")
    
    # Print the panel
    console.print(Panel(content, border_style="green", expand=False, padding=(1, 2)))
    console.print("\n[dim]Initializing security protocols...[/dim]\n")

def log(message, level="info"):
    """Prints colored log messages with timestamps."""
    timestamp = time.strftime("%H:%M:%S")
    
    if level == "info":
        console.print(f"[grey53]{timestamp}[/grey53] [bold blue][INFO][/bold blue] {message}")
    elif level == "success":
        console.print(f"[grey53]{timestamp}[/grey53] [bold green][SUCCESS][/bold green] {message}")
    elif level == "warning":
        console.print(f"[grey53]{timestamp}[/grey53] [bold yellow][WARNING][/bold yellow] {message}")
    elif level == "danger":
        console.print(f"[grey53]{timestamp}[/grey53] [bold red on white][CRITICAL][/bold red on white] {message}")
    elif level == "process":
        console.print(f"[grey53]{timestamp}[/grey53] [bold magenta][PROCESS][/bold magenta] {message}")

def fake_loading_bar(task_name):
    """Creates a visual progress bar to simulate heavy processing."""
    with Progress(
        SpinnerColumn(),
        TextColumn("[bold green]{task.description}"),
        transient=True
    ) as progress:
        task = progress.add_task(f"{task_name}...", total=100)
        while not progress.finished:
            progress.update(task, advance=2)
            time.sleep(0.03) # Adjust speed here