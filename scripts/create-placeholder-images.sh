#!/bin/bash

# Create placeholder images by duplicating logos
# This allows the presentation to work while you collect actual event photos

echo "Creating placeholder images for all events..."

# Function to create placeholders for an event
create_placeholders() {
    local brand=$1
    local event_id=$2
    local dir="public/events/${brand}/event-${event_id}/images"

    if [ ! -f "$dir/image-0.png" ]; then
        echo "  Skipping event $event_id - no logo found"
        return
    fi

    local current_count=$(ls -1 "$dir"/image-*.{png,jpg,jpeg} 2>/dev/null | wc -l | tr -d ' ')
    local needed=$((9 - current_count))

    if [ $needed -le 0 ]; then
        echo "  Event $event_id already has $current_count images"
        return
    fi

    echo "  Event $event_id: Creating $needed placeholder images..."

    for i in $(seq $current_count $((current_count + needed - 1))); do
        cp "$dir/image-0.png" "$dir/image-$i.png"
    done

    echo "    ✓ Created $needed placeholders"
}

# Create placeholders for each event
create_placeholders "apple" 22
create_placeholders "nike" 57
create_placeholders "new-balance" 64
create_placeholders "madewell" 67
create_placeholders "anthropologie" 69
create_placeholders "cb2" 73
create_placeholders "target" 85
create_placeholders "nike" 90
create_placeholders "target" 91
create_placeholders "lululemon" 93
create_placeholders "patagonia" 94
create_placeholders "nordstrom" 95

echo ""
echo "✓ Placeholder creation complete"
echo ""
echo "Next step: Update inventory"
echo "  node scripts/update-image-inventory.js all"
