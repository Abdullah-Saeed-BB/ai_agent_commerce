import matplotlib.pyplot as plt
import datetime
import io
import math


def generate_schedule_image(data):
    n_dates = len(data)
    if n_dates == 0:
        raise ValueError("No data provided.")

    # 1. Calculate Grid Dimensions (e.g., 8 dates -> 3x3 grid)
    cols = math.ceil(math.sqrt(n_dates))
    rows = math.ceil(n_dates / cols)

    plt.rc('font', family='Bahnschrift', weight='normal')

    
    fig, axes = plt.subplots(nrows=rows, ncols=cols, figsize=(cols * 4, rows * 6.3))
    
    # Flatten axes for easy iteration, handle single-plot case
    if n_dates == 1:
        axes = [axes]
    else:
        axes = axes.flatten()

    for i, entry in enumerate(data):
        ax = axes[i]
        ax.axis('off')
        
        date_str = entry['date']
        slots = entry.get('available_slots', [])
        
        # Format Data
        times, texts, counts = [], [], []
        for slot in slots:
            t = datetime.datetime.strptime(slot['time'], "%H:%M")
            times.append(t.strftime("%I:%M %p").lstrip("0"))
            
            barbers = slot['available_barbers']
            count = len(barbers)
            counts.append(count)
            
            # If multiple days, we show "X available" to keep table slim
            if n_dates > 1:
                texts.append(f"{count} slots" if count > 0 else "Full")
            else:
                def fmt_name(b):
                    name = b.get('name', '') if isinstance(b, dict) else str(b)
                    parts = name.split()
                    return f"{parts[0]} {parts[1][0]}" if len(parts) > 1 else (parts[0] if parts else "")
                barber_names = list(map(fmt_name, barbers))
                texts.append(", ".join(barber_names) if barbers else "Full")

        table_data = list(zip(times, texts))
        
        # Date Header Styling
        date_obj = datetime.date.fromisoformat(date_str)
        date_title = date_obj.strftime("%Y, %b %d")
        ax.set_title(date_title, fontsize=15, fontweight='bold', color='#2c3e50', pad=5)

        # 3. Create Table
        table = ax.table(
            cellText=table_data,
            colLabels=["Time", "Available Barbers"],
            colWidths=(
                [0.4, 0.6] if n_dates > 1 else [0.25, 0.75]),
            cellLoc='center',
            loc='center'
        )

        # 4. Refined Table Design
        table.auto_set_font_size(False)
        table.set_fontsize(9)
        table.scale(1, 1.3) # Adjust row height

        for (row, col), cell in table.get_celld().items():
            cell.set_edgecolor('#bdc3c7')
            cell.set_linewidth(0.5)
            
            if row == 0: # Header
                cell.set_facecolor('#34495e')
                cell.set_text_props(color='white', fontweight='bold')
            else: # Body
                idx = row - 1
                if counts[idx] == 0:
                    cell.set_facecolor('#fcd7d7') # Soft red
                    cell.set_text_props(color='#c0392b')
                else:
                    cell.set_facecolor('#ffffff' if row % 2 == 0 else '#f8f9fa')
                    cell.set_text_props(color='#2c3e50')

    # Hide unused subplots in the grid
    for j in range(i + 1, len(axes)):
        axes[j].axis('off')

    # 5. Final Layout Adjustments
    plt.tight_layout(pad=2.0)
    
    # Save to memory buffer
    img_buffer = io.BytesIO()
    # dpi=100 keeps the image small and "mobile friendly"
    fig.savefig(img_buffer, format='png', dpi=120, bbox_inches='tight')
    img_buffer.seek(0)
    plt.close(fig)
    
    return img_buffer