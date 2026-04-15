import { Badge } from "@/components/ui/badge"

export function BetaBadge() {
    return (
        <Badge variant="outline" className="border-orange-500 text-orange-500">Beta</Badge>
    )
}

export function NewFeatureBadge() {
    return (
        <Badge variant="outline" className="border-emerald-500 text-emerald-500">New</Badge>
    )
}

export function ProBadge() {
    return (
        <Badge variant="outline" className="border-purple-500 text-purple-500">Pro</Badge>
    )
}

export function FreeBadge() {
    return (
        <Badge variant="outline" className="border-gray-500 text-gray-500">Free</Badge>
    )
}

export function ComingSoonBadge() {
    return (
        <Badge variant="outline" className="border-sky-500 text-sky-500">Coming Soon</Badge>
    )
}